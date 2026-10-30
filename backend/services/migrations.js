import { readdir, readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export const migrationDirectory = new URL('../migrations/', import.meta.url);
export async function loadMigrations(directory = migrationDirectory) {
  const files = (await readdir(directory)).filter(name => name.endsWith('.js')).sort();
  const seen = new Set();
  return Promise.all(files.map(async name => {
    if (!/^\d{14}_[a-z0-9_]+\.js$/.test(name)) throw new Error(`Invalid migration filename: ${name}`);
    const version = name.slice(0, 14);
    if (seen.has(version)) throw new Error(`Duplicate migration version: ${version}`);
    seen.add(version);
    const url = directory instanceof URL ? new URL(name, directory) : pathToFileURL(resolve(directory, name));
    const checksum = createHash('sha256').update(await readFile(url)).digest('hex');
    return { version, name, checksum, url };
  }));
}
export function validateHistory(migrations, history) {
  const sorted = [...history].sort((a, b) => a._id.localeCompare(b._id));
  for (const [index, record] of sorted.entries()) {
    const migration = migrations[index];
    if (!migration || migration.version !== record._id || migration.name !== record.name || migration.checksum !== record.checksum) {
      throw new Error(`Migration history mismatch at ${record._id}. Restore applied files; add a new version for changes.`);
    }
  }
}
export async function migrationStatus(db, migrations) {
  const history = await db.collection('_migrations').find().toArray();
  validateHistory(migrations, history);
  const applied = new Map(history.map(record => [record._id, record]));
  return migrations.map(migration => ({ version: migration.version, name: migration.name, state: applied.has(migration.version) ? 'applied' : 'pending', appliedAt: applied.get(migration.version)?.appliedAt }));
}
export async function migrate(db, migrations, log = console.log) {
  const locks = db.collection('_migration_locks');
  const holder = randomUUID();
  try { await locks.insertOne({ _id: 'schema', holder, startedAt: new Date() }); }
  catch (error) { if (error.code === 11000) throw new Error('Another migration owns the schema lock. See docs/migrations.md for interrupted-run recovery.'); throw error; }
  try {
    const status = await migrationStatus(db, migrations);
    for (const migration of migrations.filter((_, index) => status[index].state === 'pending')) {
      const module = await import(migration.url.href);
      if (typeof module.up !== 'function') throw new Error(`${migration.name} must export up(db)`);
      await module.up(db);
      await db.collection('_migrations').insertOne({ _id: migration.version, name: migration.name, checksum: migration.checksum, appliedAt: new Date() });
      log(`Applied ${migration.name}`);
    }
    log('Database is up to date.');
  } finally { await locks.deleteOne({ _id: 'schema', holder }); }
}
