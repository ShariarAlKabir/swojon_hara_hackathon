import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function WardDashboard() {
  const [data, setData] = useState({ wards: [], oldest_unresolved: [] });
  const [selectedWard, setSelectedWard] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    api.get("/ward-dashboard")
      .then((res) => {
        if (isCurrent) setData(res.data);
      })
      .catch((err) => {
        if (isCurrent) setError(err.response?.data?.message || "Could not load ward data.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const totals = useMemo(() => data.wards.reduce(
    (summary, ward) => ({
      reports: summary.reports + Number(ward.total_reports),
      resolved: summary.resolved + Number(ward.resolved_reports),
      unresolved: summary.unresolved + Number(ward.unresolved_reports),
    }),
    { reports: 0, resolved: 0, unresolved: 0 }
  ), [data.wards]);

  const visibleOldest = selectedWard === "all"
    ? data.oldest_unresolved
    : data.oldest_unresolved.filter((report) => report.ward === selectedWard);

  return (
    <main className="ward-dashboard-page">
      <section className="ward-dashboard-hero">
        <div className="container-xl">
          <p className="section-label">Public accountability</p>
          <h1>Ward dashboard</h1>
          <p>Compare where issues are reported, how many get resolved, and which reports have waited longest.</p>
          <div className="ward-overview">
            <DashboardTotal value={data.wards.length} label="Wards reporting" />
            <DashboardTotal value={totals.reports} label="Total reports" />
            <DashboardTotal value={totals.resolved} label="Issues resolved" />
            <DashboardTotal value={totals.unresolved} label="Still unresolved" />
          </div>
        </div>
      </section>

      <div className="container-xl ward-dashboard-content">
        {loading && <div className="card dashboard-message">Loading ward performance…</div>}
        {error && <div className="action-feedback danger" role="alert">{error}</div>}

        {!loading && !error && (
          <>
            <section>
              <div className="dashboard-section-heading">
                <div><p className="section-label">Ward comparison</p><h2>Resolution performance</h2></div>
                <span className="count-badge">{data.wards.length} wards</span>
              </div>
              <div className="ward-card-grid">
                {data.wards.map((ward) => (
                  <Link
                    className="ward-performance-card"
                    key={ward.ward}
                    to={`/?ward=${encodeURIComponent(ward.ward)}#explore`}
                    aria-label={`View reports from ${ward.ward}`}
                  >
                    <div className="ward-card-heading">
                      <h3>{ward.ward}</h3>
                      <strong>{Number(ward.resolution_percentage || 0)}%</strong>
                    </div>
                    <div className="ward-progress" aria-label={`${ward.resolution_percentage || 0}% resolved`}>
                      <span style={{ width: `${ward.resolution_percentage || 0}%` }} />
                    </div>
                    <div className="ward-metrics">
                      <span><strong>{ward.total_reports}</strong>Total</span>
                      <span><strong>{ward.resolved_reports}</strong>Resolved</span>
                      <span><strong>{ward.unresolved_reports}</strong>Open</span>
                    </div>
                    <p>
                      Average fix time: <strong>
                        {ward.average_fix_days === null ? "Not enough data" : `${ward.average_fix_days} days`}
                      </strong>
                    </p>
                    <span className="ward-card-link">View ward reports <span aria-hidden="true">→</span></span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="oldest-reports-section">
              <div className="dashboard-section-heading">
                <div><p className="section-label">Needs attention</p><h2>Oldest unresolved reports</h2></div>
                <select
                  className="form-select ward-dashboard-filter"
                  value={selectedWard}
                  onChange={(event) => setSelectedWard(event.target.value)}
                  aria-label="Filter oldest reports by ward"
                >
                  <option value="all">All wards</option>
                  {data.wards.map((ward) => <option key={ward.ward} value={ward.ward}>{ward.ward}</option>)}
                </select>
              </div>

              <div className="oldest-report-list">
                {visibleOldest.length ? visibleOldest.map((report) => (
                  <Link className="oldest-report-row" to={`/reports/${report.id}`} key={report.id}>
                    <span className="oldest-report-age">{report.days_open}d</span>
                    <span className="oldest-report-copy">
                      <strong>{report.description}</strong>
                      <small>{report.ward} · {(report.category || "other").replace(/_/g, " ")}</small>
                    </span>
                    <span className={`report-chip ${report.status}`}>{report.status.replace(/_/g, " ")}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )) : <div className="empty-state"><strong>No unresolved reports for this ward.</strong></div>}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function DashboardTotal({ value, label }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}
