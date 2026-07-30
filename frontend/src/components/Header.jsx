import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("moholla_user") || "null");

  function handleLogout() {
    localStorage.removeItem("moholla_user");
    localStorage.removeItem("moholla_token");
    navigate("/login");
  }

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
        {user ? (
          <button className="secondary" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button className="secondary">Login</button>
          </Link>
        )}
      </div>
    </header>
  );
}
