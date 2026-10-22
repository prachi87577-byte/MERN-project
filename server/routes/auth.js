import { Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";

const router = Router();
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  skills: user.skills,
  education: user.education,
  experience: user.experience,
  resume: user.resume,
  isActive: user.isActive
});

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 8, max: 128 }),
    body("role").optional().isIn(["recruiter", "applicant"])
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const role = req.body.role === "recruiter" ? "recruiter" : "applicant";
      const user = await User.create({ name, email, password, role });
      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, cookieOptions()).status(201).json({ user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [body("email").trim().isEmail().normalizeEmail(), body("password").isString().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select("+password");
      if (!user || !user.isActive || !(await user.checkPassword(req.body.password))) {
        return res.status(401).json({ message: "Email or password is incorrect." });
      }
      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, cookieOptions()).json({ user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.COOKIE_SECURE === "true", sameSite: "lax", path: "/" });
  res.json({ message: "Logged out." });
});

router.get("/me", authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

export { publicUser };
export default router;
