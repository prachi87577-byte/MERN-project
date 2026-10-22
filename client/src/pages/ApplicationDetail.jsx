import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { messageFromError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Loading, Notice } from "../components/Notice";

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get(`/applications/${id}`).then(({ data }) => setApplication(data.application)).catch((err) => setError(messageFromError(err))); }, [id]);
  if (error) return <section className="content-page"><Notice error={error} /><Link to="/applications" className="text-link"><ArrowLeft size={16} /> Back</Link></section>;
  if (!application) return <Loading />;
  const person = user.role === "recruiter" || user.role === "admin";
  return <section className="content-page narrow-page"><Link to={person ? `/recruiter/jobs/${application.job?._id}/applications` : "/applications"} className="text-link"><ArrowLeft size={16} /> Back to applications</Link><div className="page-heading"><div><span className="eyebrow">APPLICATION DETAILS</span><h1>{person ? application.applicant?.name : application.job?.title}</h1><p>{person ? application.applicant?.email : application.job?.company}</p></div></div><article className="panel detail-section"><div className="app-detail-row"><span>Status</span><span className={`status status-${application.status.toLowerCase().replace(" ", "-")}`}>{application.status}</span></div><div className="app-detail-row"><span>Applied</span><strong>{new Date(application.appliedAt).toLocaleDateString()}</strong></div><div className="app-detail-row"><span>Resume</span><a className="text-link" href={application.resume} target="_blank" rel="noreferrer">Open resume <ExternalLink size={15} /></a></div>{person && application.applicant && <><div className="app-detail-row"><span>Phone</span><strong>{application.applicant.phone || "Not provided"}</strong></div><div className="detail-section"><h2>Skills</h2><div className="skill-list">{application.applicant.skills?.length ? application.applicant.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>) : <span className="muted">Not provided</span>}</div></div><div className="detail-section"><h2>Education</h2><p>{application.applicant.education || "Not provided"}</p></div><div className="detail-section"><h2>Experience</h2><p>{application.applicant.experience || "Not provided"}</p></div></>}{application.coverLetter && <div className="detail-section"><h2>Cover letter</h2><p className="description-text">{application.coverLetter}</p></div>}</article></section>;
}
