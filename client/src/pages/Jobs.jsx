import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import api, { messageFromError } from "../api";
import JobCard from "../components/JobCard";
import { Loading, Notice } from "../components/Notice";

const initial = { q: "", location: "", employmentType: "", experienceLevel: "", skills: "" };

export default function Jobs() {
  const [filters, setFilters] = useState(initial);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs(activeFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value));
      const { data } = await api.get("/jobs", { params });
      setJobs(data.jobs);
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadJobs(); }, []);
  function update(key, value) { setFilters((current) => ({ ...current, [key]: value })); }
  function submit(event) { event.preventDefault(); loadJobs(); }

  return (
    <section className="content-page">
      <div className="page-heading"><div><span className="eyebrow">OPPORTUNITIES</span><h1>Find your next role</h1><p>Explore open positions from teams ready to meet you.</p></div><span className="result-count">{jobs.length} open roles</span></div>
      <form className="filter-panel" onSubmit={submit}>
        <label className="search-field"><Search size={18} /><input value={filters.q} onChange={(e) => update("q", e.target.value)} placeholder="Job title or company" /></label>
        <label className="search-field"><input value={filters.location} onChange={(e) => update("location", e.target.value)} placeholder="Location" /></label>
        <label><span className="sr-only">Employment type</span><select value={filters.employmentType} onChange={(e) => update("employmentType", e.target.value)}><option value="">Any job type</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Remote</option></select></label>
        <label><span className="sr-only">Experience level</span><select value={filters.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)}><option value="">Any experience</option><option>Entry</option><option>Junior</option><option>Mid</option><option>Senior</option><option>Lead</option></select></label>
        <label className="search-field skills-filter"><SlidersHorizontal size={17} /><input value={filters.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Skills, comma separated" /></label>
        <button type="submit" className="button">Search jobs</button>
        <button type="button" className="clear-filter" onClick={() => { setFilters(initial); loadJobs(initial); }}><X size={15} /> Clear filters</button>
      </form>
      <Notice error={error} />
      {loading ? <Loading label="Finding opportunities…" /> : jobs.length ? <div className="job-grid">{jobs.map((job) => <JobCard key={job._id} job={job} />)}</div> : <div className="empty-state"><div className="empty-icon"><Search /></div><h2>No roles match those filters</h2><p>Try a different title, location, or job type.</p><button className="button button-outline" onClick={() => { setFilters(initial); loadJobs(initial); }}>Clear all filters</button></div>}
    </section>
  );
}
