import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

export function parseSkills(value) {
  if (Array.isArray(value)) return value.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 50);
  if (typeof value === "string") return value.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 50);
  return [];
}

export function safeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
