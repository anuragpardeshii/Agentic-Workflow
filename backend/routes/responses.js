import express from "express";
import Response from "../models/Response.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const responses = await Response.find();
    res.json(responses);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to retrieve responses" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }
    res.json(response);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to retrieve response" });
  }
});

export default router;
