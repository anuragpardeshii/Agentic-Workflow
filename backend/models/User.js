import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  schemaVersion: { type: Number, default: 2, required: true },
  activeAiConnection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AIConnection",
    default: null,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
