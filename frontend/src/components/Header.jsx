import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const rawUser = localStorage.getItem("moholla_user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  function handleLogout() {
    localStorage.removeItem("moholla_user");
    localStorage.removeItem("moholla_token");
    setMenuOpen(false);
    navigate("/login");
  }

  const navItems = [
    { to: "/", label: "Home", icon: "⌂" },
    { to: "/dashboard", label: "Dashboard", icon: "◔" },
    { to: "/report/new", label: "Report", icon: "⚑" },
  ];

  return (
    <header className="header">
      <Link to="/" className="brand-block">
        <div className="brand-mark">MF</div>
        <div>
          <h2>Moholla Fix</h2>
          <p>Civic issue response</p>
        </div>
      </Link>

      <nav className="header-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className={`nav-pill ${active ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {user ? (
          <div className="profile-menu">
            <button className="nav-pill secondary profile-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
              <span className="nav-icon">◉</span>
              <span>{user.email || "Account"}</span>
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <strong>{user.full_name || "Signed in"}</strong>
                  <span>{user.email}</span>
                </div>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={`nav-pill ${location.pathname === "/login" ? "active" : ""}`}>
            <span className="nav-icon">⇢</span>
            <span>Login</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
