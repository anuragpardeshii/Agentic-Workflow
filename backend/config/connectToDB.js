import mongoose from "mongoose";

export const connectDB = async (retries = 5, delay = 5000) => {
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
