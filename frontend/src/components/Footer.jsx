import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container-xl">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">M</span>
          <div>
            <strong>Moholla Fix</strong>
            <small>Better neighborhoods, together.</small>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/">Reports</Link>
          <Link to="/report/new">Report an issue</Link>
          <Link to="/dashboard">Ward dashboard</Link>
        </nav>
        <small>© {new Date().getFullYear()} Moholla Fix</small>
      </div>
    </footer>
  );
}
