import { Router } from "express";
import { body, param, query } from "express-validator";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { publicUser } from "./auth.js";
import { parseSkills, safeRegex, validate } from "../utils/validation.js";

const router = Router();
router.use(authenticate);

router.get("/", authorize("admin"), [query("role").optional().isIn(["admin", "recruiter", "applicant"]), query("q").optional().isString().trim().isLength({ max: 100 })], validate, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.q) {
      const expression = new RegExp(safeRegex(req.query.q), "i");
      filter.$or = [{ name: expression }, { email: expression }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authorize("admin"), param("id").isMongoId(), validate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", [body("name").optional().trim().isLength({ min: 2, max: 100 }), body("phone").optional().trim().isLength({ max: 30 }), body("resume").optional({ checkFalsy: true }).trim().isURL({ require_protocol: true }).isLength({ max: 2048 }), body("education").optional().trim().isLength({ max: 2000 }), body("experience").optional().trim().isLength({ max: 4000 })], validate, async (req, res, next) => {
  try {
    const fields = ["name", "phone", "resume", "education", "experience"];
    for (const field of fields) if (req.body[field] !== undefined) req.user[field] = req.body[field];
    if (req.body.skills !== undefined) req.user.skills = parseSkills(req.body.skills);
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", authorize("admin"), [param("id").isMongoId(), body("isActive").isBoolean()], validate, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "You cannot deactivate your own account." });
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authorize("admin"), param("id").isMongoId(), validate, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "You cannot delete your own account." });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "recruiter") {
      const jobs = await Job.find({ recruiter: user.id }).select("_id");
      await Application.deleteMany({ job: { $in: jobs.map((job) => job.id) } });
      await Job.deleteMany({ recruiter: user.id });
    }
    if (user.role === "applicant") await Application.deleteMany({ applicant: user.id });
    res.json({ message: "User and associated records were deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
