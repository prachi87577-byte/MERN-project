import { useEffect, useState } from "react";
import api, { messageFromError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Notice } from "../components/Notice";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", skills: "", education: "", experience: "", resume: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setForm({ name: user.name || "", phone: user.phone || "", skills: (user.skills || []).join(", "), education: user.education || "", experience: user.experience || "", resume: user.resume || "" });
  }, [user]);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(""); setSuccess("");
    try {
      const { data } = await api.put("/users/profile", { ...form, skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean) });
      updateUser(data.user); setSuccess("Your profile has been saved.");
    } catch (err) { setError(messageFromError(err)); }
    finally { setBusy(false); }
  }
  return <section className="content-page narrow-page"><div className="page-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile</h1><p>Keep your information current so teams can get to know you.</p></div></div>
    <Notice error={error} success={success} />
    <form className="panel form-stack profile-form" onSubmit={submit}>
      <label>Full name<input name="name" value={form.name} onChange={change} required minLength="2" /></label>
      <div className="form-row"><label>Email address<input value={user.email} disabled /></label><label>Account type<input value={user.role} disabled /></label></div>
      <label>Phone number<input name="phone" value={form.phone} onChange={change} type="tel" maxLength="30" /></label>
      {user.role === "applicant" && <>
        <label>Skills <span className="label-note">Separate skills with commas</span><input name="skills" value={form.skills} onChange={change} placeholder="React, SQL, Project management" /></label>
        <label>Education<textarea name="education" value={form.education} onChange={change} rows="3" /></label>
        <label>Experience<textarea name="experience" value={form.experience} onChange={change} rows="4" /></label>
        <label>Resume URL<input name="resume" value={form.resume} onChange={change} type="url" placeholder="https://" /></label>
      </>}
      <button className="button" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
    </form>
  </section>;
}
