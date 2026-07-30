import { Link } from "react-router-dom";

export default function ReportCard({ report }) {
  const statusClass = report.status?.replace(/\s+/g, "_").toLowerCase() || "reported";
  const category = (report.category || "Other").replace(/_/g, " ");
  const status = (report.status || "reported").replace(/_/g, " ");

  return (
    <div className="report-card">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <span className="report-category">{category}</span>
          <h3>{report.description}</h3>
        </div>
        <span className={`report-chip ${statusClass}`}>{status}</span>
      </div>
      <div className="report-meta">
        <span>⌖ {report.ward || "Unknown ward"}</span>
        <span>{report.supporter_count || 0} voices</span>
      </div>
      <div className="report-card-footer">
        <span>Community report</span>
        <Link to={`/reports/${report.id}`}>View details <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
