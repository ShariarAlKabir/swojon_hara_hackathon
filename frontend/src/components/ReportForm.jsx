import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import LocationPicker from "./LocationPicker";

export default function ReportForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
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

    if (!localStorage.getItem("moholla_token")) {
      alert("Please log in before submitting a report.");
      navigate("/login");
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      alert("Please select a location on the map.");
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

      alert("Report submitted successfully!");

      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("moholla_token");
        localStorage.removeItem("moholla_user");
        alert(err.response?.data?.message || "Please log in before submitting a report.");
        navigate("/login");
      } else {
        alert(err.response?.data?.message || "Failed to submit report.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      <div>
        <label>Category</label>
        <br />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>

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
