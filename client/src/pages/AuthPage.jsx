import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { messageFromError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Notice } from "../components/Notice";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "applicant" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || `/${user.role}`, { replace: true });
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setBusy(false);
    }
  }
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  return (
    <section className="auth-wrap">
      <div className="auth-decoration"><div className="auth-decoration-inner"><span className="brand-icon"><BriefcaseBusiness /></span><h2>Make room for what’s next.</h2><p>One place to discover opportunities, tell your story, and keep your career moving.</p><div className="auth-decoration-line" /></div></div>
      <div className="auth-content"><div className="auth-form-wrap"><span className="eyebrow">{isRegister ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span><h1>{isRegister ? "Create your account" : "Sign in to Northstar"}</h1><p className="auth-subtitle">{isRegister ? "Start exploring opportunities today." : "Your next step is waiting for you."}</p>
        <Notice error={error} />
        <form className="form-stack" onSubmit={submit}>
          {isRegister && <label>Full name<input name="name" value={form.name} onChange={change} required minLength="2" maxLength="100" autoComplete="name" /></label>}
          {isRegister && <label>I am joining as<select name="role" value={form.role} onChange={change}><option value="applicant">Job seeker</option><option value="recruiter">Recruiter</option></select></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={change} required minLength={isRegister ? "8" : undefined} autoComplete={isRegister ? "new-password" : "current-password"} /><small>{isRegister ? "Use at least 8 characters." : "Enter your account password."}</small></label>
          <button className="button full-width" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Northstar?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
      </div></div>
    </section>
  );
}
