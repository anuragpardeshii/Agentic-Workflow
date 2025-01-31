import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { systemPrompt, updatePrompt } from "../data/systemPrompt.js";
import Response from "../models/Response.js";

dotenv.config();

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-specdec",
      temperature: 1,
      max_tokens: 8192,
      top_p: 1,
      stream: true,
      stop: null,
    });

    let accumulatedContent = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        accumulatedContent += content;
      }
    }

    const response = new Response({ content: accumulatedContent, prompt });
    await response.save();

    res.status(200).json({ response });
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err.response?.data?.error?.message || err.message;
    res
      .status(500)
      .json({ error: `Failed to generate project: ${errorMessage}` });
  }
});

router.post("/update", async (req, res) => {
  const { prompt, previousContent } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: updatePrompt,
        },
        {
          role: "assistant",
          content: previousContent || "",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-specdec",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1,
      stream: true,
      stop: null,
    });

    let accumulatedContent = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        accumulatedContent += content;
      }
    }

    const response = new Response({
      prompt,
      content: accumulatedContent,
    });
    await response.save();

    res.status(200).json({ response });
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err.response?.data?.error?.message || err.message;
    res.status(500).json({
      error: `Failed to update project: ${errorMessage}`,
    });
  }
});

export default router;
