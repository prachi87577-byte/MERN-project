import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { messageFromError } from "../api";
import { Loading, Notice } from "../components/Notice";

export default function Applications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  async function load() {
    setLoading(true); setError("");
    try {
      const { data } = jobId
        ? await api.get(`/applications/job/${jobId}`, { params: { q: search || undefined, status: status || undefined } })
        : await api.get("/applications/my-applications");
      setApplications(data.applications);
    } catch (err) { setError(messageFromError(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [jobId]);
  async function withdraw(id) {
    if (!window.confirm("Withdraw this application? This cannot be undone.")) return;
    try { await api.delete(`/applications/${id}`); await load(); }
    catch (err) { setError(messageFromError(err)); }
  }
  async function updateStatus(id, nextStatus) {
    try { await api.patch(`/applications/${id}/status`, { status: nextStatus }); await load(); }
    catch (err) { setError(messageFromError(err)); }
  }
  return <section className="content-page"><div className="page-heading"><div><span className="eyebrow">{jobId ? "CANDIDATE PIPELINE" : "YOUR CAREER ACTIVITY"}</span><h1>{jobId ? "Applications received" : "My applications"}</h1><p>{jobId ? "Review candidates and update their application status." : "Track your applications and see where each one stands."}</p></div></div>
    <Notice error={error} />
    {jobId && <form className="filter-panel compact-filter" onSubmit={(e) => { e.preventDefault(); load(); }}><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, skill, or job title" /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"].map((s) => <option key={s}>{s}</option>)}</select><button className="button">Filter</button></form>}
    {loading ? <Loading /> : applications.length ? <div className="table-wrap"><table><thead><tr><th>{jobId ? "Applicant" : "Position"}</th><th>{jobId ? "Job" : "Company"}</th><th>Applied</th><th>Status</th><th>Details</th></tr></thead><tbody>{applications.map((app) => <tr key={app._id}><td><strong>{jobId ? app.applicant?.name : app.job?.title || "Position unavailable"}</strong><small className="table-sub">{jobId ? app.applicant?.email : ""}</small></td><td>{jobId ? app.job?.title : app.job?.company || "—"}</td><td>{new Date(app.appliedAt).toLocaleDateString()}</td><td>{jobId ? <select value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}>{app.status === "Applied" && <option disabled>Applied</option>}{["Under Review", "Shortlisted", "Rejected", "Selected"].map((s) => <option key={s}>{s}</option>)}</select> : <span className={`status status-${app.status.toLowerCase().replace(" ", "-")}`}>{app.status}</span>}</td><td><Link className="text-link" to={`/applications/${app._id}`}>View</Link>{!jobId && ["Applied", "Under Review"].includes(app.status) && <button className="table-action" onClick={() => withdraw(app._id)}>Withdraw</button>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>{jobId ? "No applications found" : "No applications yet"}</h2><p>{jobId ? "Try changing your search or status filter." : "When you apply for a role, it will appear here."}</p>{!jobId && <Link to="/jobs" className="button">Explore jobs</Link>}</div>}
  </section>;
}
