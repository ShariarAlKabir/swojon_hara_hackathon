import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    nid: "",
    password: "",
    ward: "",
    area: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            nid: formData.nid,
            password: formData.password,
            ward: formData.ward,
            area: formData.area,
          };

      const res = await api.post(endpoint, payload);
      if (res.data.user) {
        localStorage.setItem("moholla_user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("moholla-auth-change"));
      }
      if (res.data.token) {
        localStorage.setItem("moholla_token", res.data.token);
      }

      if (isLogin) {
        setShowLoginSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        setShowSignupSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth-page">
      {showLoginSuccess && (
        <div className="success-toast" role="status" aria-live="polite">
          <span className="success-toast-icon" aria-hidden="true">✓</span>
          Login successful
        </div>
      )}
      {showSignupSuccess && (
        <div className="success-toast" role="status" aria-live="polite">
          <span className="success-toast-icon" aria-hidden="true">✓</span>
          Account created successfully
        </div>
      )}

      <div className="card auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Community access</p>
          <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
          <p>
            {isLogin
              ? "Sign in to submit civic reports and track local issues."
              : "Join Moholla Fix to report problems and help your neighborhood."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {!isLogin && (
            <>
              <input
                type="text"
                name="full_name"
                placeholder="Full name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="nid"
                placeholder="NID"
                value={formData.nid}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="ward"
                placeholder="Ward"
                value={formData.ward}
                onChange={handleChange}
              />
              <input
                type="text"
                name="area"
                placeholder="Area"
                value={formData.area}
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              Don&apos;t have an account? <Link to="/signup">Create one</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
