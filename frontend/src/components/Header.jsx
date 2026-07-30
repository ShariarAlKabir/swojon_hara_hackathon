import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("moholla_user") || "null")
  );

  useEffect(() => {
    function syncUser() {
      setUser(JSON.parse(localStorage.getItem("moholla_user") || "null"));
    }

    window.addEventListener("moholla-auth-change", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("moholla-auth-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  async function handleLogout() {
    localStorage.removeItem("moholla_user");
    localStorage.removeItem("moholla_token");
    setUser(null);
    setIsOpen(false);
    setShowLogoutSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate("/login");
    setShowLogoutSuccess(false);
  }

  return (
    <>
      {showLogoutSuccess && (
        <div className="success-toast" role="status" aria-live="polite">
          <span className="success-toast-icon" aria-hidden="true">✓</span>
          Logout successful
        </div>
      )}

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
                <NotificationBell user={user} />
                <NavLink
                  className={({ isActive }) => `profile-button ${isActive ? "active" : ""}`}
                  to="/profile"
                  aria-label={`Open ${user.full_name || "your"} profile`}
                  title="Your profile"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-5 0-8 2.6-8 5.25C4 20.22 4.78 21 5.75 21h12.5c.97 0 1.75-.78 1.75-1.75C20 16.6 17 14 12 14Z" />
                  </svg>
                  <span className="profile-button-label">Profile</span>
                </NavLink>
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
    </>
  );
}
