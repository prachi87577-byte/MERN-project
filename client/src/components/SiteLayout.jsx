import { BriefcaseBusiness, LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SiteLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dashboardPath = user ? `/${user.role}` : "/login";
  async function signOut() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <>
      <header className="topbar">
        <div className="nav-inner">
          <Link to="/" className="brand"><span className="brand-icon"><BriefcaseBusiness size={19} /></span> northstar<span className="brand-light">careers</span></Link>
          <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
          <nav className={open ? "nav-links open" : "nav-links"}>
            <NavLink to="/jobs" onClick={() => setOpen(false)}>Find jobs</NavLink>
            {user ? (
              <>
                <NavLink to={dashboardPath} onClick={() => setOpen(false)}>Dashboard</NavLink>
                <Link to="/profile" onClick={() => setOpen(false)} className="profile-link"><UserRound size={16} /> {user.name}</Link>
                <button className="nav-logout" onClick={signOut}><LogOut size={16} /> Sign out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)}>Sign in</NavLink>
                <Link to="/register" className="button button-small" onClick={() => setOpen(false)}>Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer"><div><Link to="/" className="brand footer-brand">northstar<span className="brand-light">careers</span></Link><span>Connecting people with work that matters.</span></div><span>© {new Date().getFullYear()} Northstar Careers</span></footer>
    </>
  );
}
