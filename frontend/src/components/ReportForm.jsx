import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { CATEGORY_OPTIONS } from "../constants/categories";
import LocationPicker from "./LocationPicker";

export default function ReportForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    customCategory: "",
    description: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);

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

    const user = localStorage.getItem("moholla_user");
    if (!user) {
      navigate("/login");
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      alert("Please select a location on the map.");
      return;
    }

    if (formData.category === "OTHER" && !formData.customCategory.trim()) {
      alert("Please describe your custom category.");
      return;
    }

    try {
      setLoading(true);

      const finalCategory = formData.category === "OTHER" ? formData.customCategory.trim() : formData.category;

      await api.post("/reports", {
        category: finalCategory,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      alert("Report submitted successfully!");

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      <div>
        <label>Category</label>
        <br />
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select a category</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {formData.category === "OTHER" && (
        <div>
          <label>Custom category</label>
          <br />
          <input
            type="text"
            name="customCategory"
            value={formData.customCategory}
            onChange={handleChange}
            placeholder="Enter your category"
            required
          />
        </div>
      )}

      <br />

      <div>
        <label>Description</label>
        <br />
        <textarea
          name="description"
          rows="5"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <br />

      <div>
        <label>Select Location</label>
      </div>

      <LocationPicker onLocationSelect={handleLocationSelect} />

      <br />

      <div>
        <strong>Selected Coordinates</strong>
        <p>
          Latitude:{" "}
          {formData.latitude !== null
            ? formData.latitude.toFixed(6)
            : "Not selected"}
        </p>

        <p>
          Longitude:{" "}
          {formData.longitude !== null
            ? formData.longitude.toFixed(6)
            : "Not selected"}
        </p>
      </div>

      <br />

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Report"}
      </button>

    </form>
  );
}