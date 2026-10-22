import { Router } from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/admin", authorize("admin"), async (req, res, next) => {
  try {
    const [users, recruiters, applicants, jobs, applications, pendingJobs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "applicant" }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ status: "Pending" })
    ]);
    res.json({ stats: { users, recruiters, applicants, jobs, applications, pendingJobs } });
  } catch (error) {
    next(error);
  }
});

router.get("/recruiter", authorize("recruiter"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    const applications = await Application.countDocuments({ job: { $in: jobs.map((job) => job.id) } });
    res.json({ stats: { jobs: jobs.length, applications, pendingJobs: jobs.filter((job) => job.status === "Pending").length }, jobs });
  } catch (error) {
    next(error);
  }
});

router.get("/applicant", authorize("applicant"), async (req, res, next) => {
  try {
    const [applications, selected] = await Promise.all([
      Application.find({ applicant: req.user.id }).populate("job", "title company status").sort({ appliedAt: -1 }).limit(5),
      Application.countDocuments({ applicant: req.user.id, status: "Selected" })
    ]);
    res.json({ stats: { applications: await Application.countDocuments({ applicant: req.user.id }), selected }, applications });
  } catch (error) {
    next(error);
  }
});

export default router;
