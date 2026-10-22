import { ArrowRight, BriefcaseBusiness, FileText, Plus, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { messageFromError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Loading, Notice } from "../components/Notice";

const config = {
  admin: { endpoint: "/dashboard/admin", title: "Admin overview", links: [["Manage users", "/admin/users"], ["Review jobs", "/admin/jobs"], ["Applications", "/admin/applications"]] },
  recruiter: { endpoint: "/dashboard/recruiter", title: "Recruiter dashboard", links: [["Manage jobs", "/recruiter/jobs/manage"], ["Post a job", "/recruiter/jobs/new"]] },
  applicant: { endpoint: "/dashboard/applicant", title: "Applicant dashboard", links: [["My applications", "/applications"], ["Browse jobs", "/jobs"], ["Edit profile", "/profile"]] }
};

export default function Dashboard() {
  const { user } = useAuth();
  const settings = config[user.role];
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get(settings.endpoint).then(({ data: result }) => setData(result)).catch((err) => setError(messageFromError(err)));
  }, [settings.endpoint]);
  if (!data && !error) return <Loading label="Loading dashboard…" />;
  const stats = data?.stats || {};
  const cards = user.role === "admin"
    ? [["Total users", stats.users, UsersRound], ["Recruiters", stats.recruiters, BriefcaseBusiness], ["Applicants", stats.applicants, UsersRound], ["Job listings", stats.jobs, FileText], ["Applications", stats.applications, FileText], ["Awaiting review", stats.pendingJobs, BriefcaseBusiness]]
    : user.role === "recruiter"
      ? [["Your jobs", stats.jobs, BriefcaseBusiness], ["Applications received", stats.applications, FileText], ["Awaiting review", stats.pendingJobs, UsersRound]]
      : [["Applications sent", stats.applications, FileText], ["Selected", stats.selected, BriefcaseBusiness]];

  return (
    <section className="content-page dashboard-page">
      <div className="page-heading"><div><span className="eyebrow">{user.role.toUpperCase()} WORKSPACE</span><h1>{settings.title}</h1><p>Welcome back, {user.name}. Here’s what’s happening.</p></div></div>
      <Notice error={error} />
      <div className="stats-grid">{cards.map(([label, value, Icon]) => <article className="stat-card" key={label}><span className="stat-icon"><Icon size={20} /></span><span className="stat-label">{label}</span><strong>{value ?? "—"}</strong></article>)}</div>
      <div className="dashboard-lower"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Quick actions</h2></div></div><div className="quick-links">{settings.links.map(([label, path]) => <Link to={path} key={path}><span>{label}</span><ArrowRight size={17} /></Link>)}</div></section>
        {user.role === "recruiter" && <section className="panel"><div className="panel-heading"><div><span className="eyebrow">YOUR LISTINGS</span><h2>Recent jobs</h2></div><Link to="/recruiter/jobs/manage" className="text-link">View all</Link></div>{data?.jobs?.length ? <div className="compact-list">{data.jobs.slice(0, 4).map((job) => <div key={job._id}><span><b>{job.title}</b><small>{job.company}</small></span><span className={`status status-${job.status.toLowerCase()}`}>{job.status}</span></div>)}</div> : <p className="muted">No job listings yet. <Link to="/recruiter/jobs/new">Post your first role.</Link></p>}</section>}
        {user.role === "applicant" && <section className="panel"><div className="panel-heading"><div><span className="eyebrow">LATEST UPDATES</span><h2>Recent applications</h2></div><Link to="/applications" className="text-link">View all</Link></div>{data?.applications?.length ? <div className="compact-list">{data.applications.map((item) => <div key={item._id}><span><b>{item.job?.title || "Role unavailable"}</b><small>{item.job?.company || "—"}</small></span><span className={`status status-${item.status.toLowerCase().replace(" ", "-")}`}>{item.status}</span></div>)}</div> : <p className="muted">No applications yet. <Link to="/jobs">Find a role to apply for.</Link></p>}</section>}
      </div>
      {user.role === "admin" && <div className="admin-shortcuts">{settings.links.map(([label, path]) => <Link className="button button-outline" to={path} key={path}><Plus size={16} />{label}</Link>)}</div>}
    </section>
  );
}
