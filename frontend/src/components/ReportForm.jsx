import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import LocationPicker from "./LocationPicker";
import { REPORT_CATEGORIES } from "../constants/categories";

export default function ReportForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const isLoggedIn = Boolean(localStorage.getItem("moholla_token"));

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleLocationSelect(location) {
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!localStorage.getItem("moholla_token")) {
      setFeedback({
        type: "warning",
        message: "You need to log in before submitting a report. This keeps community reports accountable.",
        needsLogin: true,
      });
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      setFeedback({
        type: "warning",
        message: "Choose the issue location on the map before submitting.",
      });
      return;
    }

    try {
      setLoading(true);

      await api.post("/reports", {
        category: formData.category,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      setFeedback({
        type: "success",
        message: "Report submitted successfully. Taking you back to community reports…",
      });
      window.setTimeout(() => navigate("/"), 700);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("moholla_token");
        localStorage.removeItem("moholla_user");
        setFeedback({
          type: "warning",
          message: err.response?.data?.message || "Your session expired. Log in again to submit this report.",
          needsLogin: true,
        });
      } else {
        setFeedback({
          type: "danger",
          message: err.response?.data?.message || "The report could not be submitted. Check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="report-form">
      {!isLoggedIn && !feedback && (
        <div className="action-feedback warning" role="status">
          <span>You must be logged in to submit a verified community report.</span>
          <Link to="/login">Log in</Link>
        </div>
      )}

      {feedback && (
        <div className={`action-feedback ${feedback.type}`} role="alert">
          <span>{feedback.message}</span>
          {feedback.needsLogin && <Link to="/login">Log in now</Link>}
        </div>
      )}

      <div>
        <label className="form-label" htmlFor="report-category">What type of issue is this?</label>
        <select
          id="report-category"
          className="form-select"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select a category</option>
          {REPORT_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
        <small className="form-help">Choose the closest match so neighbors can find and filter your report.</small>
      </div>

      <div>
        <label className="form-label" htmlFor="report-description">Describe the problem</label>
        <textarea
          id="report-description"
          className="form-control"
          name="description"
          rows="5"
          value={formData.description}
          onChange={handleChange}
          placeholder="What happened, how long has it been there, and who is affected?"
          required
        />
        <small className="form-help">Be specific, but do not include anyone’s private information.</small>
      </div>

      <div>
        <label className="form-label">Where is the issue?</label>
        <p className="form-help mb-2">Tap the map to place the marker at the problem location.</p>
        <div className="location-picker-shell">
          <LocationPicker onLocationSelect={handleLocationSelect} />
        </div>
      </div>

      <div className={`location-selection ${formData.latitude !== null ? "selected" : ""}`}>
        <strong>{formData.latitude !== null ? "Location selected" : "No location selected yet"}</strong>
        {formData.latitude !== null && (
          <span>{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
