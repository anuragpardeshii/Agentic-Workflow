import express from "express";
import nodemailer from "nodemailer";
import { body } from "express-validator";
import { asyncRoute, validate } from "../middleware/validate.js";
import rateLimit from "express-rate-limit";
const router = express.Router();
router.post(
  "/",
  rateLimit({
    windowMs: 3600000,
    limit: 5,
    message: { error: "Please try again later." },
  }),
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Enter your name"),
  body("email").isString().isEmail().withMessage("Enter a valid email"),
  body("message")
    .isString()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message must be 10–5000 characters"),
  validate,
  asyncRoute(async (req, res) => {
    if (!process.env.SMTP_HOST || !process.env.CONTACT_TO)
      return res
        .status(503)
        .json({ error: "Contact delivery is not configured." });
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 1025),
      secure: process.env.SMTP_SECURE === "true",
      connectionTimeout: 10000,
      socketTimeout: 15000,
      ...(process.env.SMTP_USER
        ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
        : {}),
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM || "Buildfast <hello@localhost>",
      to: process.env.CONTACT_TO,
      replyTo: req.body.email,
      subject: "Buildfast contact request",
      text: `Name: ${req.body.name}\nEmail: ${req.body.email}\n\n${req.body.message}`,
    });
    res.json({ message: "Your message has been sent." });
  }),
);
export default router;
