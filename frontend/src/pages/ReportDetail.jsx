import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function ReportDetail() {
  const { id } = useParams();
  const [data, setData] = useState({ report: null, updates: [] });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSupport() {
    try {
      await api.post(`/reports/${id}/support`);
      loadReport();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStatus(status) {
    try {
      await api.post(`/reports/${id}/status`, { status, note });
      setNote("");
      loadReport();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdate() {
    if (!note.trim()) return;
    try {
      setLoading(true);
      await api.post(`/reports/${id}/updates`, { note });
      setNote("");
      loadReport();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
            <button onClick={handleSupport}>Add Your Voice</button>
            <button className="secondary" onClick={() => handleStatus("in_progress")}>Still There</button>
            <button className="secondary" onClick={() => handleStatus("fixed")}>Mark Fixed</button>
          </div>
        </div>

        <div className="card">
          <h2>Post an update</h2>
          <textarea rows="4" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Share what has changed on the ground..." />
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleUpdate} disabled={loading}>{loading ? "Posting..." : "Post Update"}</button>
          </div>
        </div>

        <div className="card">
          <h2>Status timeline</h2>
          <div className="timeline">
            {data.updates.length === 0 ? <p>No updates yet.</p> : data.updates.map((item) => (
              <div key={item.id} className="timeline-item">
                <strong>{item.kind}</strong>
                <p>{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
