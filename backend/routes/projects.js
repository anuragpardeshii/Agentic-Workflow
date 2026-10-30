import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { asyncRoute, validate } from "../middleware/validate.js";
import { generateProject } from "../services/ai/index.js";
import Response from "../models/Response.js";
import { resolveAIEnvironment } from "../services/ai/connections.js";
const router = express.Router();
router.use(
  authenticate,
  rateLimit({
    windowMs: 60000,
    limit: 5,
    keyGenerator: (req) => req.user,
    message: { error: "Please wait before generating again." },
  }),
);
router.post(
  ["/generate", "/update"],
  body("connectionId")
    .optional({ nullable: true })
    .isString()
    .bail()
    .isMongoId()
    .withMessage("Choose a valid API connection"),
  body("prompt")
    .isString()
    .trim()
    .isLength({ min: 3, max: 10000 })
    .withMessage("Describe your project in 3–10000 characters"),
  body("previousContent")
    .optional()
    .isString()
    .isLength({ max: 500000 })
    .withMessage("Project is too large"),
  body("previousContent").custom((value, { req }) => {
    if (req.path === "/update" && (typeof value !== "string" || !value.trim()))
      throw new Error("An existing project is required for an update");
    return true;
  }),
  validate,
  asyncRoute(async (req, res) => {
    const content = await generateProject(
      req.body.prompt,
      req.body.previousContent,
      { env: await resolveAIEnvironment(req.user, req.body.connectionId) },
    );
    const response = await Response.create({
      owner: req.user,
      prompt: req.body.prompt,
      content,
    });
    res.status(201).json({ response });
  }),
);
export default router;
