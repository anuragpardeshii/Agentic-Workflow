import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { loadMigrations, validateHistory, migrate, migrationStatus } from '../services/migrations.js';

test('migration history rejects edits, missing versions, and out-of-order additions', () => {
  const files = [{ version: '20261022000100', name: 'a', checksum: 'original' }];
  const history = [{ _id: files[0].version, name: 'a', checksum: 'original' }];
  assert.doesNotThrow(() => validateHistory(files, history));
  assert.throws(() => validateHistory([{ ...files[0], checksum: 'changed' }], history), /mismatch/);
  assert.throws(() => validateHistory([], history), /mismatch/);
  assert.throws(() => validateHistory([{ version: '20261021000100' }, ...files], history), /mismatch/);
});

test('migration loader rejects duplicate versions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'buildfast-migrations-'));
  try {
    await writeFile(join(dir, '20261022000100_first.js'), '');
    await writeFile(join(dir, '20261022000100_second.js'), '');
    await assert.rejects(loadMigrations(dir), /Duplicate/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('real Mongo migrations: apply, rerun, preserve legacy data, lock, and failed-run recovery', { skip: !process.env.MIGRATION_TEST_URI }, async () => {
  const client = new mongoose.mongo.MongoClient(process.env.MIGRATION_TEST_URI);
  await client.connect();
  const db = client.db(`migration_test_${randomUUID().replaceAll('-', '')}`);
  const dir = await mkdtemp(join(tmpdir(), 'buildfast-migrations-'));
  try {
    await db.collection('users').insertOne({ username: 'legacy', email: 'legacy@example.com' });
    await db.collection('responses').insertOne({ prompt: 'Legacy project', content: 'original' });
    const files = await loadMigrations();
    await migrate(db, files, () => {});
    await migrate(db, files, () => {});
    assert.equal(await db.collection('_migrations').countDocuments(), files.length);
    assert.ok((await migrationStatus(db, files)).every(row => row.state === 'applied'));
    const legacy = await db.collection('responses').findOne();
    assert.equal(legacy.schemaVersion, 1);
    assert.equal(legacy.content, 'original');
    assert.equal(legacy.owner, undefined);
    assert.ok((await db.collection('responses').indexes()).some(index => index.name === 'owner_1_createdAt_-1'));
    await assert.rejects(db.collection('users').insertOne({ username: 'another', email: 'legacy@example.com' }), { code: 11000 });
    await db.collection('_migration_locks').insertOne({ _id: 'schema', holder: 'other' });
    await assert.rejects(migrate(db, files, () => {}), /lock/);
    await db.collection('_migration_locks').deleteOne({ _id: 'schema' });
    await assert.rejects(migrate(db, files.map((file, index) => index ? file : { ...file, checksum: 'changed' }), () => {}), /mismatch/);
    assert.equal(await db.collection('_migration_locks').countDocuments(), 0);
    await writeFile(join(dir, 'package.json'), '{"type":"module"}');
    await writeFile(join(dir, '20990101000000_retry.js'), `export async function up(db) {
      const result = await db.collection('retry_marker').updateOne({_id:'test'}, {$setOnInsert:{created:true}}, {upsert:true});
      if (result.upsertedCount) throw new Error('Simulated interruption');
    }`);
    const next = [...files, ...await loadMigrations(dir)];
    await assert.rejects(migrate(db, next, () => {}), /Simulated/);
    assert.equal(await db.collection('_migrations').countDocuments(), files.length);
    assert.equal(await db.collection('_migration_locks').countDocuments(), 0);
    await migrate(db, next, () => {});
    assert.equal(await db.collection('_migrations').countDocuments(), next.length);
    assert.equal(await db.collection('retry_marker').countDocuments(), 1);
  } finally {
    await db.dropDatabase();
    await client.close();
    await rm(dir, { recursive: true, force: true });
  }
});
