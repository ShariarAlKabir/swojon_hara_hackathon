import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <h2>Moholla Fix</h2>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Link to="/dashboard">
          <button className="secondary">Ward Dashboard</button>
        </Link>
        <Link to="/report/new">
          <button>+ New Report</button>
        </Link>
      </div>
    </header>
  );
}
