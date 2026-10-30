// Legacy projects stay ownerless and inaccessible; ownership is never guessed.
export async function up(db) {
  for (const name of ['users', 'responses']) {
    await db.collection(name).updateMany({ schemaVersion: { $exists: false } }, { $set: { schemaVersion: 1 } });
  }
}
