import { Router } from "express";
import { body, param, query } from "express-validator";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { parseSkills, safeRegex, validate } from "../utils/validation.js";

const router = Router();
const allowedTypes = ["Full-time", "Part-time", "Internship", "Remote"];
const allowedLevels = ["Entry", "Junior", "Mid", "Senior", "Lead"];
const openFilter = () => ({ status: "Approved", deadline: { $gte: new Date() } });

router.get(
  "/",
  [
    query("q").optional().isString().trim().isLength({ max: 100 }),
    query("location").optional().isString().trim().isLength({ max: 100 }),
    query("employmentType").optional().isIn(allowedTypes),
    query("experienceLevel").optional().isIn(allowedLevels),
    query("skills").optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const filter = openFilter();
      const search = req.query.q ? safeRegex(req.query.q) : null;
      if (search) filter.$or = ["title", "company"].map((field) => ({ [field]: { $regex: search, $options: "i" } }));
      if (req.query.location) filter.location = { $regex: safeRegex(req.query.location), $options: "i" };
      if (req.query.employmentType) filter.employmentType = req.query.employmentType;
      if (req.query.experienceLevel) filter.experienceLevel = req.query.experienceLevel;
      if (req.query.skills) {
        const skills = req.query.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
        if (skills.length) filter.skills = { $in: skills.map((skill) => new RegExp(safeRegex(skill), "i")) };
      }
      const jobs = await Job.find(filter).populate("recruiter", "name").sort({ createdAt: -1 }).limit(100);
      res.json({ jobs });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/manage", authenticate, authorize("recruiter", "admin"), async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { recruiter: req.user.id };
    const jobs = await Job.find(filter).populate("recruiter", "name").sort({ createdAt: -1 }).limit(200);
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  authenticate,
  authorize("recruiter"),
  [
    body("title").trim().isLength({ min: 2, max: 150 }),
    body("company").trim().isLength({ min: 2, max: 150 }),
    body("description").trim().isLength({ min: 20, max: 12000 }),
    body("location").trim().isLength({ min: 2, max: 150 }),
    body("employmentType").isIn(allowedTypes),
    body("experienceLevel").isIn(allowedLevels),
    body("deadline").isISO8601().toDate(),
    body("vacancies").optional().isInt({ min: 1, max: 10000 }),
    body("salary").optional().isString().trim().isLength({ max: 100 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const job = await Job.create({ ...req.body, skills: parseSkills(req.body.skills), recruiter: req.user.id, status: "Pending" });
      res.status(201).json({ job });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", param("id").isMongoId(), validate, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, ...openFilter() }).populate("recruiter", "name");
    if (!job) return res.status(404).json({ message: "Job not found or no longer open." });
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  authenticate,
  authorize("recruiter"),
  [param("id").isMongoId(), body("title").optional().trim().isLength({ min: 2, max: 150 }), body("description").optional().trim().isLength({ min: 20, max: 12000 })],
  validate,
  async (req, res, next) => {
    try {
      const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id });
      if (!job) return res.status(404).json({ message: "Job not found." });
      const fields = ["title", "company", "description", "location", "employmentType", "experienceLevel", "salary", "vacancies", "deadline"];
      for (const field of fields) if (req.body[field] !== undefined) job[field] = req.body[field];
      if (req.body.skills !== undefined) job.skills = parseSkills(req.body.skills);
      if (job.status === "Rejected") job.status = "Pending";
      await job.save();
      res.json({ job });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", authenticate, authorize("recruiter", "admin"), param("id").isMongoId(), validate, async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, recruiter: req.user.id };
    const job = await Job.findOneAndDelete(filter);
    if (!job) return res.status(404).json({ message: "Job not found." });
    await Application.deleteMany({ job: job.id });
    res.json({ message: "Job and its applications were deleted." });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", authenticate, authorize("admin"), [param("id").isMongoId(), body("status").isIn(["Approved", "Rejected", "Closed", "Pending"])], validate, async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

export default router;
