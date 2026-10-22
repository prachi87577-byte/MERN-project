import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    resume: { type: String, required: true, trim: true, maxlength: 2048 },
    coverLetter: { type: String, trim: true, maxlength: 6000, default: "" },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"],
      default: "Applied",
      index: true
    },
    appliedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
