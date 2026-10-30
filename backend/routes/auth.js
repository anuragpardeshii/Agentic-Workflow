import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { validate, asyncRoute } from "../middleware/validate.js";
const router = express.Router();
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: { error: "Too many sign-in attempts. Try again later." },
  }),
);
const email = () =>
  body("email")
    .isString()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email")
    .toLowerCase();
const tokenFor = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    algorithm: "HS256",
  });
router.post(
  "/register",
  email(),
  body("username")
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2–50 characters"),
  body("password")
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8–72 characters")
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must be at most 72 bytes"),
  validate,
  asyncRoute(async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ token: tokenFor(user) });
  }),
);
router.post(
  "/login",
  email(),
  body("password")
    .isString()
    .isLength({ min: 1, max: 72 })
    .withMessage("Password is required"),
  validate,
  asyncRoute(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: tokenFor(user) });
  }),
);
router.get(
  "/validate",
  authenticate,
  asyncRoute(async (req, res) => {
    const user = await User.findById(req.user).select("username email");
    if (!user) return res.status(401).json({ error: "Please sign in again" });
    res.json({ valid: true, user });
  }),
);
export default router;
