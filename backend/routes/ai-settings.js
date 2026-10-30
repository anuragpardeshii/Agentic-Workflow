import express from "express";
import mongoose from "mongoose";
import { body, param } from "express-validator";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { asyncRoute, validate } from "../middleware/validate.js";
import AIConnection from "../models/AIConnection.js";
import User from "../models/User.js";
import {
  supportedProviders,
  validateConnection,
  PROVIDERS,
} from "../services/ai/catalog.js";
import { vaultReady, encryptKey } from "../services/ai/vault.js";
import {
  ownedConnection,
  connectionMetadata,
  checkConnection,
} from "../services/ai/connections.js";

const router = express.Router();
router.use(authenticate, (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
const id = () => param("id").isMongoId().withMessage("Invalid connection ID");
const fields = (create) => [
  body("billingAccepted")
    .custom((value) => value === true)
    .withMessage("Confirm that your provider account may be charged"),
  body("label")
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage("Name your connection in 1–60 characters"),
  body("model")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Enter a model ID"),
  (create ? body("apiKey") : body("apiKey").optional())
    .isString()
    .bail()
    .trim()
    .isLength({ min: 12, max: 512 })
    .matches(/^[\x21-\x7e]+$/)
    .withMessage("Enter a valid API key without spaces"),
];
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const [connections, user] = await Promise.all([
      AIConnection.find({ owner: req.user }).sort({ createdAt: 1 }),
      User.findById(req.user).select("activeAiConnection"),
    ]);
    if (!user) return res.status(401).json({ error: "Please sign in again" });
    const provider = process.env.AI_PROVIDER || "ollama";
    const defaults = supportedProviders().find((item) => item.id === provider);
    res.json({
      providers: supportedProviders(),
      connections: connections.map(connectionMetadata),
      activeConnectionId: user.activeAiConnection
        ? String(user.activeAiConnection)
        : null,
      storageReady: vaultReady(),
      freeOnly: process.env.AI_FREE_ONLY !== "false",
      serverDefault: {
        provider,
        model: process.env.AI_MODEL || defaults?.defaultModel || "",
        enabled:
          Boolean(defaults) &&
          (process.env.AI_FREE_ONLY === "false" ||
            ["ollama", "openrouter"].includes(provider)),
      },
    });
  }),
);
router.post(
  "/connections",
  fields(true),
  body("provider")
    .isIn(Object.keys(PROVIDERS))
    .withMessage("Select a supported provider"),
  validate,
  asyncRoute(async (req, res) => {
    validateConnection(req.body.provider, req.body.model);
    const connection = {
      _id: new mongoose.Types.ObjectId(),
      owner: req.user,
      provider: req.body.provider,
      billingAcceptedAt: new Date(),
      label: req.body.label,
      model: req.body.model,
      keyLastFour: req.body.apiKey.slice(-4),
    };
    connection.encryptedKey = encryptKey(req.body.apiKey, connection);
    try {
      const saved = await AIConnection.create(connection);
      res.status(201).json({ connection: connectionMetadata(saved) });
    } catch (error) {
      if (error.code === 11000)
        return res.status(409).json({
          error:
            "This provider is already connected. Edit its existing configuration.",
        });
      throw error;
    }
  }),
);
router.put(
  "/connections/:id",
  id(),
  fields(false),
  validate,
  asyncRoute(async (req, res) => {
    const connection = await ownedConnection(req.user, req.params.id);
    validateConnection(connection.provider, req.body.model);
    const changes = {
      billingAcceptedAt: new Date(),
      label: req.body.label,
      model: req.body.model,
    };
    if (req.body.apiKey !== undefined) {
      changes.encryptedKey = encryptKey(req.body.apiKey, connection);
      changes.keyLastFour = req.body.apiKey.slice(-4);
    }
    const saved = await AIConnection.findOneAndUpdate(
      { _id: connection._id, owner: req.user },
      { $set: changes },
      { new: true, runValidators: true },
    );
    if (!saved)
      return res.status(404).json({ error: "API connection not found." });
    res.json({ connection: connectionMetadata(saved) });
  }),
);
router.delete(
  "/connections/:id",
  id(),
  validate,
  asyncRoute(async (req, res) => {
    const deleted = await AIConnection.findOneAndDelete({
      _id: req.params.id,
      owner: req.user,
    });
    if (!deleted)
      return res.status(404).json({ error: "API connection not found." });
    await User.updateOne(
      { _id: req.user, activeAiConnection: deleted._id },
      { $set: { activeAiConnection: null } },
    );
    res.json({
      message:
        "Connection removed. The provider's original key is not revoked.",
    });
  }),
);
router.put(
  "/default",
  body("connectionId")
    .custom(
      (value) =>
        value === null ||
        (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)),
    )
    .withMessage("Choose a saved connection or the server default"),
  validate,
  asyncRoute(async (req, res) => {
    if (req.body.connectionId) {
      const connection = await ownedConnection(req.user, req.body.connectionId);
      validateConnection(connection.provider, connection.model);
    }
    const result = await User.updateOne(
      { _id: req.user },
      { $set: { activeAiConnection: req.body.connectionId } },
    );
    if (!result.matchedCount)
      return res.status(401).json({ error: "Please sign in again" });
    res.json({ activeConnectionId: req.body.connectionId });
  }),
);
router.post(
  "/connections/:id/check",
  id(),
  validate,
  rateLimit({
    windowMs: 60000,
    limit: 5,
    keyGenerator: (req) => req.user,
    message: { error: "Please wait before checking another key." },
  }),
  asyncRoute(async (req, res) => {
    res.json(
      await checkConnection(
        await ownedConnection(req.user, req.params.id, true),
      ),
    );
  }),
);
export default router;
