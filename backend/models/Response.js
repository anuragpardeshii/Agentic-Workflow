import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  schemaVersion: { type: Number, default: 1, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  history: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Response = mongoose.model("Response", responseSchema);

export default Response;
