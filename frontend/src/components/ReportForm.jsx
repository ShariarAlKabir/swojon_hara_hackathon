import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import LocationPicker from "./LocationPicker";
import { REPORT_CATEGORIES } from "../constants/categories";
import { getLiveLocation } from "../utils/location";
import PhotoUpload from "./PhotoUpload";

export default function ReportForm() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("moholla_user") || "null");

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    ward: currentUser?.ward || "",
    latitude: null,
    longitude: null,
  });
  const [photo, setPhoto] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const feedbackRef = useRef(null);

  function showFeedback(nextFeedback) {
    setFeedback(nextFeedback);
    window.requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      feedbackRef.current?.focus({ preventScroll: true });
    });
  }

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
      showFeedback({
        type: "warning",
        message: "You need to log in before submitting a report. This keeps community reports accountable.",
        needsLogin: true,
      });
      return;
    }

    if (!formData.category) {
      showFeedback({ type: "warning", message: "Select an issue category before submitting." });
      return;
    }

    if (!formData.description.trim()) {
      showFeedback({ type: "warning", message: "Describe the issue before submitting." });
      return;
    }

    if (!formData.ward.trim()) {
      showFeedback({ type: "warning", message: "Enter the ward where this issue is located." });
      return;
    }

    if (!photo) {
      showFeedback({ type: "warning", message: "Upload a photo of the issue before submitting." });
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      showFeedback({
        type: "warning",
        message: "Choose the issue location on the map before submitting.",
      });
      return;
    }

    try {
      setLoading(true);
      showFeedback({
        type: "info",
        message: "Verifying your live location against the selected report location…",
      });
      const liveLocation = await getLiveLocation();

      await api.post("/reports", {
        category: formData.category,
        description: formData.description,
        photo_url: photo,
        ward: formData.ward,
        latitude: formData.latitude,
        longitude: formData.longitude,
        verification_latitude: liveLocation.latitude,
        verification_longitude: liveLocation.longitude,
      });

      showFeedback({
        type: "success",
        message: "Location verified and report submitted. Taking you back to community reports…",
      });
      window.setTimeout(() => navigate("/"), 700);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("moholla_token");
        localStorage.removeItem("moholla_user");
        showFeedback({
          type: "warning",
          message: err.response?.data?.message || "Your session expired. Log in again to submit this report.",
          needsLogin: true,
        });
      } else {
        showFeedback({
          type: "danger",
          message: err.response?.data?.message || err.message || "The report could not be submitted. Check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="report-form" noValidate>
      {feedback && (
        <div
          ref={feedbackRef}
          className={`action-feedback ${feedback.type}`}
          role="alert"
          tabIndex="-1"
        >
          <span>{feedback.message}</span>
          {feedback.needsLogin && <Link to="/login">Log in now</Link>}
        </div>
      )}

      <div>
        <label className="form-label" htmlFor="report-category">What type of issue is this?</label>
        <div className="category-select-wrap">
          <select
            id="report-category"
            className="form-select"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="" disabled>Choose an issue category</option>
            {REPORT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
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
        />
        <small className="form-help">Be specific, but do not include anyone’s private information.</small>
      </div>

      <div>
        <label className="form-label" htmlFor="report-ward">Which ward is it in?</label>
        <input
          id="report-ward"
          className="form-control"
          name="ward"
          value={formData.ward}
          onChange={handleChange}
          placeholder="e.g. 12 or Ward 12"
        />
        <small className="form-help">This connects the report to the public ward dashboard.</small>
      </div>

      <PhotoUpload
        id="report-photo"
        label="Photo proof"
        value={photo}
        onChange={setPhoto}
        required
        helpText="Take a photo or choose one from your device (maximum 3 MB)."
      />

      <div>
        <label className="form-label">Where is the issue?</label>
        <p className="form-help mb-2">
          Tap the map to place the issue marker. When you submit, your current GPS location
          will be checked to confirm you are within 2 km.
        </p>
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
        {loading ? "Verifying location…" : "Submit Report"}
      </button>
    </form>
  );
}
