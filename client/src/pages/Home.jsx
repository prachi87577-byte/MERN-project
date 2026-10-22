import { ArrowRight, BriefcaseBusiness, CheckCircle2, Search, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Find work that<br /><em>moves you forward.</em></h1>
          <p>Discover meaningful opportunities from teams building what’s next. Your next great role is closer than you think.</p>
          <Link className="button" to="/jobs"><Search size={18} /> Explore open roles <ArrowRight size={17} /></Link>
          <div className="hero-proof"><div className="avatar-stack"><b>J</b><b>M</b><b>A</b><b>+</b></div><span>People finding their next opportunity</span></div>
        </div>
        <div className="hero-visual">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="visual-panel"><div className="visual-label">CAREER MOMENTUM</div><div className="visual-number">Your future,<br /><span>in motion.</span></div><div className="visual-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="visual-caption"><span className="green-dot" /> New opportunities every week</div></div>
          <div className="floating-card floating-top"><div className="floating-icon"><BriefcaseBusiness size={17} /></div><div><b>New role match</b><small>Product Designer · Remote</small></div><CheckCircle2 size={18} className="check-icon" /></div>
          <div className="floating-card floating-bottom"><div className="floating-icon coral"><UsersRound size={17} /></div><div><b>People-first companies</b><small>Find a team where you belong</small></div></div>
        </div>
      </section>
      <section className="home-stats"><div><strong>Find your fit</strong><span>Roles across industries and experience levels</span></div><div><strong>Built for people</strong><span>Simple tools for candidates and hiring teams</span></div><div><strong>Move with confidence</strong><span>Track every application in one place</span></div></section>
      <section className="home-cta"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Make your next move count.</h2><p>Browse open roles and find the opportunity that feels right.</p></div><Link to="/jobs" className="button button-light">Browse jobs <ArrowRight size={17} /></Link></section>
    </div>
  );
}
