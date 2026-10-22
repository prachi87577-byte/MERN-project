import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["admin", "recruiter", "applicant"], default: "applicant", immutable: true },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    skills: { type: [String], default: [] },
    education: { type: String, trim: true, maxlength: 2000, default: "" },
    experience: { type: String, trim: true, maxlength: 4000, default: "" },
    resume: { type: String, trim: true, maxlength: 2048, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.checkPassword = function checkPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
