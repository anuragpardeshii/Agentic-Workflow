import express from "express";
import mongoose from "mongoose";
import Response from "../models/Response.js";
import { authenticate } from "../middleware/auth.js";
import { asyncRoute } from "../middleware/validate.js";
const router = express.Router();
router.use(authenticate);
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const page = Math.max(
      1,
      Math.min(10000, Number.parseInt(req.query.page, 10) || 1),
    );
    res.json(
      await Response.find({ owner: req.user })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 20)
        .limit(20),
    );
  }),
);
router.get(
  "/:id",
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: "Invalid project ID" });
    const response = await Response.findOne({
      _id: req.params.id,
      owner: req.user,
    });
    if (!response) return res.status(404).json({ error: "Project not found" });
    res.json(response);
  }),
);
export default router;
