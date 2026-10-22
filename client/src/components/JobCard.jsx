import { ArrowUpRight, Briefcase, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <article className="job-card">
      <div className="job-company-row"><span className="company-mark">{job.company?.slice(0, 1).toUpperCase()}</span><div><h3>{job.title}</h3><p>{job.company}</p></div><Link to={`/jobs/${job._id}`} className="icon-link" aria-label={`View ${job.title}`}><ArrowUpRight size={19} /></Link></div>
      <div className="job-meta"><span><MapPin size={15} />{job.location}</span><span><Briefcase size={15} />{job.employmentType}</span></div>
      <div className="job-footer"><span className="salary">{job.salary || "Salary not specified"}</span><span className="tag">{job.experienceLevel}</span></div>
    </article>
  );
}
