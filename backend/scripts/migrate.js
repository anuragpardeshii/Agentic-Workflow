import 'dotenv/config';
import mongoose from 'mongoose';
import { loadMigrations, migrate, migrationStatus } from '../services/migrations.js';
const command = process.argv[2] || 'up';
if (!['up', 'status'].includes(command)) throw new Error('Usage: node scripts/migrate.js [up|status]');
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
const client = new mongoose.mongo.MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const migrations = await loadMigrations();
  if (command === 'status') console.table(await migrationStatus(client.db(), migrations));
  else await migrate(client.db(), migrations);
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
} finally { await client.close(); }
