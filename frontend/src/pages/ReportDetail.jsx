import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { getLiveLocation } from "../utils/location";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ report: null, updates: [] });
  const [note, setNote] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [feedback, setFeedback] = useState(null);

  const loadReport = useCallback(async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    let isCurrent = true;

    api.get(`/reports/${id}`)
      .then((res) => {
        if (isCurrent) setData(res.data);
      })
      .catch((err) => console.error(err));

    return () => {
      isCurrent = false;
    };
  }, [id]);

  function handleActionError(err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || "The action could not be completed.";

    if (status === 401) {
      localStorage.removeItem("moholla_token");
      localStorage.removeItem("moholla_user");
      setFeedback({ type: "warning", message: `${message} Redirecting you to login…` });
      window.setTimeout(() => navigate("/login"), 1200);
      return;
    }

    setFeedback({ type: status === 409 ? "info" : "danger", message });
  }

  async function runVerifiedAction(actionName, request, successMessage) {
    if (!localStorage.getItem("moholla_token")) {
      setFeedback({ type: "warning", message: "Log in to continue with verified community actions." });
      return false;
    }

    try {
      setActiveAction(actionName);
      setFeedback({ type: "info", message: "Checking your live location…" });
      const location = await getLiveLocation();
      await request(location);
      setFeedback({ type: "success", message: successMessage });
      loadReport();
      return true;
    } catch (err) {
      handleActionError(err);
      return false;
    } finally {
      setActiveAction("");
    }
  }

  function handleSupport() {
    runVerifiedAction(
      "support",
      (location) => api.post(`/reports/${id}/support`, { ...location }),
      "Your voice was added. Thank you for verifying this issue."
    );
  }

  function handleStatus(status) {
    runVerifiedAction(
      status,
      (location) => api.post(`/reports/${id}/status`, { status, note, ...location }),
      status === "fixed" ? "The report was marked as fixed." : "The issue was confirmed as still present."
    ).then((succeeded) => {
      if (succeeded) setNote("");
    });
  }

  function handleUpdate() {
    if (!note.trim()) {
      setFeedback({ type: "warning", message: "Write a short update before posting." });
      return;
    }

    runVerifiedAction(
      "update",
      (location) => api.post(`/reports/${id}/updates`, { note, ...location }),
      "Your verified update was added to the public timeline."
    ).then((succeeded) => {
      if (succeeded) setNote("");
    });
  }

  if (!data.report) return <div className="container"><p>Loading...</p></div>;

  return (
    <div>
      <div className="container detail-page">
        <div className="card">
          <Link to="/">← Back home</Link>
          <h1 className="hero-title" style={{ fontSize: "1.8rem", marginTop: "10px" }}>{data.report.category}</h1>
          <p>{data.report.description}</p>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            Ward: {data.report.ward || "Unknown"} • {data.report.supporter_count || 0} supporters
          </p>
          <p className="verification-note">Verified actions require login and a live location within 2 km of this report.</p>
          {feedback && (
            <div className={`action-feedback ${feedback.type}`} role="status">
              <span>{feedback.message}</span>
              {!localStorage.getItem("moholla_token") && <Link to="/login">Log in</Link>}
            </div>
          )}
          <div className="report-actions">
            <button disabled={Boolean(activeAction)} onClick={handleSupport}>
              {activeAction === "support" ? "Verifying…" : "Add Your Voice"}
            </button>
            <button disabled={Boolean(activeAction)} className="secondary" onClick={() => handleStatus("in_progress")}>
              {activeAction === "in_progress" ? "Verifying…" : "Still There"}
            </button>
            <button disabled={Boolean(activeAction)} className="secondary" onClick={() => handleStatus("fixed")}>
              {activeAction === "fixed" ? "Verifying…" : "Mark Fixed"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Post an update</h2>
          <textarea rows="4" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Share what has changed on the ground..." />
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleUpdate} disabled={Boolean(activeAction)}>
              {activeAction === "update" ? "Verifying location…" : "Post Verified Update"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Status timeline</h2>
          <div className="timeline">
            {data.updates.length === 0 ? <p>No updates yet.</p> : data.updates.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-heading">
                  <strong>{item.kind.replace(/_/g, " ")}</strong>
                  <time>{new Date(item.created_at).toLocaleString()}</time>
                </div>
                <p>{item.note}</p>
                <small>
                  {item.actor_label}
                  {item.distance_km !== null && ` · verified ${Number(item.distance_km).toFixed(2)} km away`}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
