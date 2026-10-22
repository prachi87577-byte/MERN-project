import { ArrowLeft, Briefcase, CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { messageFromError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Loading, Notice } from "../components/Notice";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data.job)).catch((err) => setError(messageFromError(err)));
  }, [id]);
  if (error) return <section className="content-page"><Notice error={error} /><Link to="/jobs" className="text-link"><ArrowLeft size={16} /> Back to jobs</Link></section>;
  if (!job) return <Loading label="Loading job details…" />;

  return (
    <section className="content-page detail-page">
      <Link to="/jobs" className="text-link"><ArrowLeft size={16} /> All jobs</Link>
      <div className="detail-layout">
        <article className="detail-main">
          <div className="detail-company"><span className="company-mark large">{job.company.slice(0, 1).toUpperCase()}</span><div><h1>{job.title}</h1><p>{job.company}</p></div></div>
          <div className="job-meta detail-meta"><span><MapPin size={16} />{job.location}</span><span><Briefcase size={16} />{job.employmentType}</span><span><CalendarDays size={16} />Apply by {new Date(job.deadline).toLocaleDateString()}</span></div>
          <div className="detail-section"><h2>About the role</h2><p className="description-text">{job.description}</p></div>
          <div className="detail-section"><h2>Skills & experience</h2><div className="skill-list">{job.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div><p>Experience level: <strong>{job.experienceLevel}</strong></p></div>
        </article>
        <aside className="apply-card"><span className="eyebrow">COMPENSATION</span><h2>{job.salary || "Not specified"}</h2><p>{job.vacancies} opening{job.vacancies === 1 ? "" : "s"} available</p>{user?.role === "applicant" ? <Link to={`/apply/${job._id}`} className="button full-width">Apply for this role</Link> : user ? <p className="muted">Applicant accounts can apply for jobs.</p> : <Link to="/login" className="button full-width">Sign in to apply</Link>}<div className="apply-note">Applications are reviewed by the hiring team. Keep your profile up to date.</div></aside>
      </div>
    </section>
  );
}
