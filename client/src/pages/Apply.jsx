import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { messageFromError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Notice } from "../components/Notice";

export default function Apply() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState(user.resume || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api.post("/applications", { jobId, resume, coverLetter }); navigate("/applications"); }
    catch (err) { setError(messageFromError(err)); }
    finally { setBusy(false); }
  }
  return <section className="content-page narrow-page"><Link to={`/jobs/${jobId}`} className="text-link"><ArrowLeft size={16} /> Back to job</Link><div className="page-heading"><div><span className="eyebrow">APPLICATION</span><h1>Apply for this role</h1><p>Share your resume and a note for the hiring team.</p></div></div><Notice error={error} /><form className="panel form-stack" onSubmit={submit}><label>Resume URL<input type="url" value={resume} onChange={(e) => setResume(e.target.value)} required placeholder="https://…" /></label><small className="muted">Use a shareable link to your resume. You can add one to your profile for next time.</small><label>Cover letter <span className="label-note">Optional</span><textarea rows="8" maxLength="6000" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the hiring team why this role interests you…" /></label><button className="button" disabled={busy}>{busy ? "Submitting…" : "Submit application"}</button></form></section>;
}
