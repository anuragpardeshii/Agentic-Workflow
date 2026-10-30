// Preserve existing index names to adopt databases created by Mongoose.
export async function up(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_1' });
  await db.collection('users').createIndex({ username: 1 }, { unique: true, name: 'username_1' });
  await db.collection('responses').createIndex({ owner: 1 }, { name: 'owner_1' });
  await db.collection('responses').createIndex({ owner: 1, createdAt: -1 }, { name: 'owner_1_createdAt_-1' });
}
