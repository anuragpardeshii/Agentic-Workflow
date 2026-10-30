import "dotenv/config";
import mongoose from "mongoose";
import { loadMigrations, migrate } from "./services/migrations.js";
import { app } from "./app.js";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error("JWT_SECRET must contain at least 32 characters");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  autoIndex: false,
});
await migrate(mongoose.connection.db, await loadMigrations());
const server = app.listen(process.env.PORT || 3000, () =>
  console.log("API ready"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
