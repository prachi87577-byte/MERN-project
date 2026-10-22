import { Router } from "express";
import { body, param, query } from "express-validator";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { safeRegex, validate } from "../utils/validation.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin"), async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("applicant", "name email")
      .populate("job", "title company recruiter")
      .sort({ appliedAt: -1 })
      .limit(300);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  authorize("applicant"),
  [body("jobId").isMongoId(), body("resume").trim().isURL({ require_protocol: true }).isLength({ max: 2048 }), body("coverLetter").optional().trim().isLength({ max: 6000 })],
  validate,
  async (req, res, next) => {
    try {
      const job = await Job.findOne({ _id: req.body.jobId, status: "Approved", deadline: { $gte: new Date() } });
      if (!job) return res.status(404).json({ message: "This job is not accepting applications." });
      const application = await Application.create({
        applicant: req.user.id,
        job: job.id,
        resume: req.body.resume,
        coverLetter: req.body.coverLetter || ""
      });
      res.status(201).json({ application });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "You have already applied for this job." });
      next(error);
    }
  }
);

router.get("/my-applications", authorize("applicant"), async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id }).populate("job").sort({ appliedAt: -1 });
    res.json({ applications });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/job/:jobId",
  authorize("recruiter", "admin"),
  [param("jobId").isMongoId(), query("status").optional().isIn(["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"]), query("q").optional().isString().trim().isLength({ max: 100 })],
  validate,
  async (req, res, next) => {
    try {
      const jobFilter = req.user.role === "admin" ? { _id: req.params.jobId } : { _id: req.params.jobId, recruiter: req.user.id };
      const job = await Job.findOne(jobFilter);
      if (!job) return res.status(404).json({ message: "Job not found." });
      const filter = { job: job.id };
      if (req.query.status) filter.status = req.query.status;
      let applications = await Application.find(filter).populate("applicant", "name email phone skills education experience resume").populate("job", "title company").sort({ appliedAt: -1 });
      if (req.query.q) {
        const expression = new RegExp(safeRegex(req.query.q), "i");
        applications = applications.filter((item) => expression.test(item.applicant.name) || item.applicant.skills.some((skill) => expression.test(skill)) || expression.test(item.job.title));
      }
      res.json({ applications });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", param("id").isMongoId(), validate, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate("applicant", "name email phone skills education experience resume").populate({ path: "job", populate: { path: "recruiter", select: "name" } });
    if (!application) return res.status(404).json({ message: "Application not found." });
    const allowed =
      req.user.role === "admin" ||
      (req.user.role === "applicant" && application.applicant.id === req.user.id) ||
      (req.user.role === "recruiter" && application.job.recruiter.id === req.user.id);
    if (!allowed) return res.status(403).json({ message: "You cannot view this application." });
    res.json({ application });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", authorize("recruiter"), [param("id").isMongoId(), body("status").isIn(["Under Review", "Shortlisted", "Rejected", "Selected"])], validate, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate("job", "recruiter");
    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.job.recruiter.toString() !== req.user.id) return res.status(403).json({ message: "You cannot update applications for another recruiter’s job." });
    application.status = req.body.status;
    await application.save();
    res.json({ application });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", param("id").isMongoId(), validate, async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, applicant: req.user.id, status: { $in: ["Applied", "Under Review"] } };
    const application = await Application.findOneAndDelete(filter);
    if (!application) return res.status(404).json({ message: "Application not found or already finalized." });
    res.json({ message: "Application withdrawn." });
  } catch (error) {
    next(error);
  }
});

export default router;
