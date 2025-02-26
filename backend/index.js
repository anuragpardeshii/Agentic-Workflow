import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/connectToDB.js";
import groqRoutes from "./routes/groq.js";
import responsesRoutes from "./routes/responses.js";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || `http://localhost:${PORT}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});
app.use("/api/", limiter);
app.use("/api/groq", groqRoutes);
app.use("/api/responses", responsesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);

server.listen(PORT, () => {
  console.log(
    `Server running on port http://localhost:${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});