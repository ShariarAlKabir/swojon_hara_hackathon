import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("moholla_user") || "null");

  function handleLogout() {
    localStorage.removeItem("moholla_user");
    localStorage.removeItem("moholla_token");
    navigate("/login");
  }

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top" aria-label="Main navigation">
      <div className="container-xl">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>
            <strong>Moholla Fix</strong>
            <small>Better neighborhoods, together</small>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNavbar"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="mainNavbar"
          onClick={() => setIsOpen(false)}
        >
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end to="/">
              Home
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/report/new">
              Report an issue
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/dashboard">
              Ward dashboard
            </NavLink>
            {user ? (
              <div className="nav-user d-flex align-items-lg-center gap-2 ms-lg-3">
                <span className="user-greeting">Hi, {user.full_name?.split(" ")[0] || "neighbor"}</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Log out</button>
              </div>
            ) : (
              <div className="d-flex gap-2 ms-lg-3 mt-3 mt-lg-0">
                <Link className="btn btn-outline-primary" to="/login">Log in</Link>
                <Link className="btn btn-primary" to="/signup">Join community</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
