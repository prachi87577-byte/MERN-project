import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

await connectDatabase();
const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before seeding.");
}

let admin = await User.findOne({ email });
if (admin && admin.role !== "admin") {
  throw new Error(`ADMIN_EMAIL is already registered as a ${admin.role}; choose a different ADMIN_EMAIL.`);
}
if (!admin) {
  admin = await User.create({
    name: process.env.ADMIN_NAME || "Portal Administrator",
    email,
    password,
    role: "admin"
  });
  console.log(`Created initial admin account: ${email}`);
} else {
  console.log(`Admin account already exists: ${email}`);
}

let recruiter = await User.findOne({ email: "demo.recruiter@example.com" });
if (!recruiter) {
  recruiter = await User.create({
    name: "Demo Recruiter",
    email: "demo.recruiter@example.com",
    password: "DemoRecruiter123!",
    role: "recruiter"
  });
}

if ((await Job.countDocuments()) === 0) {
  await Job.insertMany([
    {
      title: "Frontend Developer",
      company: "Northstar Digital",
      description: "Build accessible, responsive web experiences with a collaborative product team. You will work with React, modern CSS, and REST APIs.",
      skills: ["React", "JavaScript", "CSS"],
      location: "New York, NY",
      employmentType: "Full-time",
      experienceLevel: "Junior",
      salary: "$70,000 - $95,000",
      vacancies: 2,
      deadline: new Date(Date.now() + 45 * 86400000),
      recruiter: recruiter.id,
      status: "Approved"
    },
    {
      title: "Data Analyst Intern",
      company: "BrightPath Labs",
      description: "Support data quality and reporting projects. Ideal for a curious student comfortable with SQL, spreadsheets, and communicating findings.",
      skills: ["SQL", "Python", "Analytics"],
      location: "Remote",
      employmentType: "Internship",
      experienceLevel: "Entry",
      salary: "$25 - $32 / hour",
      vacancies: 3,
      deadline: new Date(Date.now() + 60 * 86400000),
      recruiter: recruiter.id,
      status: "Approved"
    }
  ]);
  console.log("Added sample job listings.");
}

await mongoose.disconnect();
