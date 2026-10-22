import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { messageFromError } from "../api";
import { Notice } from "../components/Notice";

const blank = { title: "", company: "", description: "", skills: "", location: "", employmentType: "Full-time", experienceLevel: "Entry", salary: "", vacancies: 1, deadline: "" };

export function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id) api.get("/jobs/manage").then(({ data }) => {
      const job = data.jobs.find((item) => item._id === id);
      if (job) setForm({ ...job, skills: job.skills.join(", "), deadline: job.deadline.slice(0, 10) });
      else setError("Job not found or you do not own it.");
    }).catch((err) => setError(messageFromError(err)));
  }, [id]);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const payload = { ...form, skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean), vacancies: Number(form.vacancies), deadline: new Date(`${form.deadline}T23:59:59`).toISOString() };
    try { if (id) await api.put(`/jobs/${id}`, payload); else await api.post("/jobs", payload); navigate("/recruiter/jobs/manage"); }
    catch (err) { setError(messageFromError(err)); }
    finally { setBusy(false); }
  }
  return <section className="content-page narrow-page"><div className="page-heading"><div><span className="eyebrow">RECRUITER WORKSPACE</span><h1>{id ? "Edit job listing" : "Post a new role"}</h1><p>{id ? "Update the details candidates see." : "Your listing will be reviewed before it goes live."}</p></div></div><Notice error={error} /><form className="panel form-stack" onSubmit={submit}>
    <label>Job title<input name="title" value={form.title} onChange={change} required minLength="2" /></label><label>Company<input name="company" value={form.company} onChange={change} required /></label><label>Job description<textarea name="description" rows="7" value={form.description} onChange={change} required minLength="20" /></label><label>Required skills <span className="label-note">Comma separated</span><input name="skills" value={form.skills} onChange={change} /></label><label>Location<input name="location" value={form.location} onChange={change} required /></label>
    <div className="form-row"><label>Employment type<select name="employmentType" value={form.employmentType} onChange={change}>{["Full-time", "Part-time", "Internship", "Remote"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Experience level<select name="experienceLevel" value={form.experienceLevel} onChange={change}>{["Entry", "Junior", "Mid", "Senior", "Lead"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
    <div className="form-row"><label>Salary range<input name="salary" value={form.salary} onChange={change} placeholder="$60,000 - $80,000" /></label><label>Vacancies<input name="vacancies" type="number" value={form.vacancies} onChange={change} min="1" required /></label></div>
    <label>Application deadline<input name="deadline" type="date" value={form.deadline} onChange={change} min={new Date().toISOString().slice(0, 10)} required /></label><div className="form-actions"><Link to="/recruiter/jobs/manage" className="button button-outline">Cancel</Link><button className="button" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Submit for review"}</button></div>
  </form></section>;
}

export function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function load() { try { const { data } = await api.get("/jobs/manage"); setJobs(data.jobs); } catch (err) { setError(messageFromError(err)); } }
  useEffect(() => { load(); }, []);
  async function remove(job) {
    if (!window.confirm(`Delete “${job.title}” and its applications?`)) return;
    try { await api.delete(`/jobs/${job._id}`); await load(); } catch (err) { setError(messageFromError(err)); }
  }
  return <section className="content-page"><div className="page-heading"><div><span className="eyebrow">RECRUITER WORKSPACE</span><h1>Manage your jobs</h1><p>Keep your listings current and review incoming applications.</p></div><Link to="/recruiter/jobs/new" className="button">Post a job</Link></div><Notice error={error} />
    {jobs.length ? <div className="table-wrap"><table><thead><tr><th>Position</th><th>Location</th><th>Status</th><th>Deadline</th><th>Actions</th></tr></thead><tbody>{jobs.map((job) => <tr key={job._id}><td><strong>{job.title}</strong><small className="table-sub">{job.company}</small></td><td>{job.location}</td><td><span className={`status status-${job.status.toLowerCase()}`}>{job.status}</span></td><td>{new Date(job.deadline).toLocaleDateString()}</td><td className="table-actions"><button className="text-button" onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}>Edit</button><Link className="text-button" to={`/recruiter/jobs/${job._id}/applications`}>Applicants</Link><button className="text-button danger-text" onClick={() => remove(job)}>Delete</button></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>No job listings yet</h2><p>Create a listing to start finding great candidates.</p><Link to="/recruiter/jobs/new" className="button">Post your first job</Link></div>}</section>;
}
