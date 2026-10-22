import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 12000 },
    skills: { type: [String], default: [] },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Internship", "Remote"], required: true },
    experienceLevel: { type: String, enum: ["Entry", "Junior", "Mid", "Senior", "Lead"], required: true },
    salary: { type: String, trim: true, maxlength: 100, default: "Not specified" },
    vacancies: { type: Number, min: 1, max: 10000, default: 1 },
    deadline: { type: Date, required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Closed"], default: "Pending", index: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

jobSchema.index({ title: "text", company: "text", description: "text", skills: "text", location: "text" });

export default mongoose.model("Job", jobSchema);
