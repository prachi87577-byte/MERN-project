import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { messageFromError } from "../api";
import { Notice } from "../components/Notice";

export function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  async function load() { try { const { data } = await api.get("/jobs/manage"); setJobs(data.jobs); } catch (err) { setError(messageFromError(err)); } }
  useEffect(() => { load(); }, []);
  async function setStatus(job, status) {
    try { await api.patch(`/jobs/${job._id}/status`, { status }); await load(); }
    catch (err) { setError(messageFromError(err)); }
  }
  async function remove(job) {
    if (!window.confirm(`Delete “${job.title}” and associated applications?`)) return;
    try { await api.delete(`/jobs/${job._id}`); await load(); }
    catch (err) { setError(messageFromError(err)); }
  }
  return <section className="content-page"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>Manage jobs</h1><p>Review submissions and manage every listing on the platform.</p></div></div><Notice error={error} /><div className="table-wrap"><table><thead><tr><th>Position</th><th>Recruiter</th><th>Status</th><th>Deadline</th><th>Actions</th></tr></thead><tbody>{jobs.map((job) => <tr key={job._id}><td><strong>{job.title}</strong><small className="table-sub">{job.company}</small></td><td>{job.recruiter?.name}</td><td><span className={`status status-${job.status.toLowerCase()}`}>{job.status}</span></td><td>{new Date(job.deadline).toLocaleDateString()}</td><td className="table-actions">{job.status === "Pending" && <><button className="text-button" onClick={() => setStatus(job, "Approved")}>Approve</button><button className="text-button danger-text" onClick={() => setStatus(job, "Rejected")}>Reject</button></>}<button className="text-button danger-text" onClick={() => remove(job)}>Delete</button></td></tr>)}</tbody></table>{!jobs.length && <p className="empty-inline">No job listings available.</p>}</div></section>;
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  async function load() { try { const { data } = await api.get("/users", { params: query ? { q: query } : {} }); setUsers(data.users); } catch (err) { setError(messageFromError(err)); } }
  useEffect(() => { load(); }, []);
  async function toggle(user) {
    try { await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive }); await load(); }
    catch (err) { setError(messageFromError(err)); }
  }
  async function remove(user) {
    if (!window.confirm(`Delete ${user.name} and associated account records?`)) return;
    try { await api.delete(`/users/${user.id}`); await load(); }
    catch (err) { setError(messageFromError(err)); }
  }
  return <section className="content-page"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>Manage users</h1><p>Review recruiter and applicant accounts.</p></div></div><Notice error={error} /><form className="filter-panel compact-filter" onSubmit={(e) => { e.preventDefault(); load(); }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" /><button className="button">Search</button></form><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td className="capitalize">{user.role}</td><td><span className={`status ${user.isActive ? "status-approved" : "status-rejected"}`}>{user.isActive ? "Active" : "Inactive"}</span></td><td className="table-actions"><button className="text-button" onClick={() => toggle(user)}>{user.isActive ? "Deactivate" : "Activate"}</button><button className="text-button danger-text" onClick={() => remove(user)}>Delete</button></td></tr>)}</tbody></table>{!users.length && <p className="empty-inline">No users found.</p>}</div></section>;
}

export function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/applications").then(({ data }) => setApplications(data.applications)).catch((err) => setError(messageFromError(err))); }, []);
  return <section className="content-page"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>All applications</h1><p>View candidate submissions across the platform.</p></div></div><Notice error={error} /><div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Position</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead><tbody>{applications.map((app) => <tr key={app._id}><td><strong>{app.applicant?.name}</strong><small className="table-sub">{app.applicant?.email}</small></td><td>{app.job?.title || "Position unavailable"}</td><td>{app.job?.company || "—"}</td><td>{new Date(app.appliedAt).toLocaleDateString()}</td><td><span className={`status status-${app.status.toLowerCase().replace(" ", "-")}`}>{app.status}</span></td></tr>)}</tbody></table>{!applications.length && <p className="empty-inline">No applications yet.</p>}</div></section>;
}
