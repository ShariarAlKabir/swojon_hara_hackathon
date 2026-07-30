import { useEffect, useState } from "react";
import api from "../api/api";

export default function WardDashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/ward-dashboard");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      <div className="container">
        <h1 className="hero-title">Ward dashboard</h1>
        <p className="hero-copy">A public view of where issues are concentrated and where resolution is lagging.</p>
        <div className="stats" style={{ marginTop: "20px" }}>
          {stats.map((item) => (
            <div key={item.ward} className="stat-box">
              <h3>{item.ward}</h3>
              <p>Total reports: {item.total_reports}</p>
              <p>Resolved: {item.resolved_reports}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
