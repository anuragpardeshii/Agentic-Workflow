import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { systemPrompt } from "../data/systemPrompt.js"; // Import the system prompt
import Response from "../models/Response.js"; // Import the Response model

dotenv.config();

const router = express.Router();

// Initialize the GROQ client with your API key
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

    // Save the response to the database
    const response = new Response({ content: accumulatedContent });
    await response.save();

    res.json({ content: accumulatedContent });
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err.response?.data?.error?.message || err.message;
    res
      .status(500)
      .json({ error: `Failed to generate project: ${errorMessage}` });
  }
});

export default router;
