import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import auth from "./routes/auth.js";
import generation from "./routes/projects.js";
import responses from "./routes/responses.js";
import contact from "./routes/contact.js";
import aiSettings from "./routes/ai-settings.js";
export const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
app.get("/health", (req, res) =>
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
  }),
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  }),
);
app.use("/api/auth", auth);
app.use("/api/projects", generation);
app.use("/api/groq", generation);
app.use("/api/responses", responses);
app.use("/api/contact", contact);
app.use("/api/ai-settings", aiSettings);
app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || (err.code === 11000 ? 409 : 500);
  res.status(status).json({
    error:
      status === 500
        ? "Something went wrong. Please try again."
        : err.code === 11000
          ? "Email or username already registered"
          : err.message,
  });
});
