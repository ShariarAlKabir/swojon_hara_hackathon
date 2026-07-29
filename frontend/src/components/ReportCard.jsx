import { Link } from "react-router-dom";

export default function ReportCard({ report }) {
  const statusClass = report.status?.replace(/\s+/g, "_").toLowerCase() || "reported";

  return (
    <div className="report-card">
      <h3>{report.category}</h3>
      <p>{report.description}</p>
      <p style={{ color: "#64748b", marginTop: "8px" }}>
        Ward: {report.ward || "Unknown"}
      </p>
      <div className={`report-chip ${statusClass}`}>{report.status || "reported"}</div>
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{report.supporter_count || 0} voices</span>
        <Link to={`/reports/${report.id}`}>Open details →</Link>
      </div>
    </div>
  );
}
