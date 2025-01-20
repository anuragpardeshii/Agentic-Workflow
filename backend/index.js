import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import groqRoutes from "./routes/groq.js";
import responsesRoutes from "./routes/responses.js"; // Import the responses routes
import rateLimit from "express-rate-limit";

dotenv.config();

// Validate required environment variables
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

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS with allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      if (i === retries - 1) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
      }
      console.log(`Retrying MongoDB connection in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
connectDB();

// Socket.IO connection handling
const connectedClients = new Set();
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  connectedClients.add(socket.id);
  // Broadcast current connected clients count
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

// Routes
app.use("/api/groq", groqRoutes);
app.use("/api/responses", responsesRoutes); // Use the responses routes

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
