import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/connectToDB.js";
import { Server } from "socket.io";
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

const requiredEnvVars = [
  "MONGO_URI",
  "GROQ_API_KEY",
  "PORT",
  "ALLOWED_ORIGINS",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const allowedOrigins = process.env.ALLOWED_ORIGINS;
const io = new Server(server, {
  cors: {
    origin: allowedOrigins || `http://localhost:${PORT}`,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    origin: allowedOrigins || `http://localhost:${PORT}`,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

const connectedClients = new Set();
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  connectedClients.add(socket.id);
  io.emit("clientCount", connectedClients.size);
  socket.on("error", (error) => {
    console.error("Socket error:", socket.id, error);
  });
  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
    connectedClients.delete(socket.id);
    io.emit("clientCount", connectedClients.size);
  });
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
