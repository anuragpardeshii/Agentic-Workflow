import mongoose from "mongoose";
import { PROVIDERS } from "../services/ai/catalog.js";
const schema = new mongoose.Schema(
  {
    schemaVersion: { type: Number, default: 1, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: Object.keys(PROVIDERS),
      required: true,
    },
    label: { type: String, required: true, maxlength: 60 },
    model: { type: String, required: true, maxlength: 120 },
    billingAcceptedAt: { type: Date, required: true },
    keyLastFour: { type: String, required: true },
    encryptedKey: { type: Object, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.encryptedKey;
        return ret;
      },
    },
  },
);
schema.index({ owner: 1, provider: 1 }, { unique: true });
export default mongoose.model("AIConnection", schema);
