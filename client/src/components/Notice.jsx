export function Notice({ error, success }) {
  if (!error && !success) return null;
  return <div className={error ? "notice notice-error" : "notice notice-success"} role="status">{error || success}</div>;
}

export function Loading({ label = "Loading…" }) {
  return <div className="loading"><span className="spinner" />{label}</div>;
}
