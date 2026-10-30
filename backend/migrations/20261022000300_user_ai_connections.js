export async function up(db) {
  await db.collection('aiconnections').createIndex({ owner: 1, provider: 1 }, { unique: true, name: 'owner_1_provider_1' });
  await db.collection('users').updateMany({ activeAiConnection: { $exists: false } }, { $set: { activeAiConnection: null } });
  await db.collection('users').updateMany({ schemaVersion: { $lt: 2 } }, { $set: { schemaVersion: 2 } });
}
