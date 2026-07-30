import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import ReportList from "../components/ReportList";
import MapView from "../components/MapView";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ category: "", status: "", ward: "" });

  useEffect(() => {
    let isCurrent = true;
    const params = new URLSearchParams(filters);

    api.get(`/reports?${params.toString()}`)
      .then((res) => {
        if (isCurrent) setReports(res.data);
      })
      .catch((err) => console.error(err));

    return () => {
      isCurrent = false;
    };
  }, [filters]);

  const resolvedCount = reports.filter((report) => report.status === "fixed").length;
  const supporterCount = reports.reduce((total, report) => total + Number(report.supporter_count || 0), 0);
  const hasFilters = Object.values(filters).some(Boolean);

  function clearFilters() {
    setFilters({ category: "", status: "", ward: "" });
  }

  return (
    <main>
      <section className="home-hero">
        <div className="container-xl">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="hero-kicker">Your neighborhood. Your voice.</span>
              <h1>See a local problem?<br />Help make it visible.</h1>
              <p className="hero-copy">
                Report everyday issues, follow what is happening nearby, and join
                your neighbors in getting problems noticed and fixed.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                <Link className="btn btn-primary btn-lg" to="/report/new">Report an issue</Link>
                <a className="btn btn-light btn-lg" href="#explore">Explore nearby reports</a>
              </div>
              <p className="hero-reassurance">Free to use · Community verified · Publicly visible</p>
            </div>
            <div className="col-lg-5">
              <div className="how-it-works">
                <p className="section-label">Getting started is easy</p>
                <div className="step"><span>1</span><div><strong>Spot a problem</strong><small>Potholes, flooding, waste, lights, and more.</small></div></div>
                <div className="step"><span>2</span><div><strong>Share the details</strong><small>Add a photo and confirm the location.</small></div></div>
                <div className="step"><span>3</span><div><strong>Build support</strong><small>Neighbors add their voice and track progress.</small></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-summary">
        <div className="container-xl">
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="summary-item"><strong>{reports.length}</strong><span>Visible reports</span></div></div>
            <div className="col-6 col-lg-3"><div className="summary-item"><strong>{resolvedCount}</strong><span>Issues resolved</span></div></div>
            <div className="col-6 col-lg-3"><div className="summary-item"><strong>{supporterCount}</strong><span>Community voices</span></div></div>
            <div className="col-6 col-lg-3"><Link className="summary-link" to="/dashboard">View ward progress <span>→</span></Link></div>
          </div>
        </div>
      </section>

      <section className="explore-section" id="explore">
        <div className="container-xl">
          <div className="row align-items-end g-3 mb-4">
            <div className="col-lg">
              <p className="section-label">Community reports</p>
              <h2>What’s happening nearby</h2>
              <p className="section-copy">Use the filters to find issues that matter to your area.</p>
            </div>
            <div className="col-lg-auto">
              <Link className="btn btn-outline-primary" to="/report/new">+ Add a new report</Link>
            </div>
          </div>

          <div className="filter-panel">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label" htmlFor="category-filter">Category</label>
                <select id="category-filter" className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All categories</option>
                  <option value="pothole">Pothole</option>
                  <option value="flooding">Flooding</option>
                  <option value="streetlight">Streetlight</option>
                  <option value="garbage">Garbage</option>
                  <option value="open_manhole">Open manhole</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="status-filter">Status</label>
                <select id="status-filter" className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All statuses</option>
                  <option value="reported">Reported</option>
                  <option value="in_progress">In progress</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="ward-filter">Ward or area</label>
                <div className="d-flex gap-2">
                  <input id="ward-filter" className="form-control" placeholder="e.g. Ward 12" value={filters.ward} onChange={(e) => setFilters({ ...filters, ward: e.target.value })} />
                  {hasFilters && <button className="btn btn-light text-nowrap" onClick={clearFilters}>Clear</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-xl-7">
              <div className="content-heading">
                <div><h3>Report map</h3><p>Select a marker to see report details.</p></div>
                <span className="count-badge">{reports.length} found</span>
              </div>
              <MapView reports={reports} />
            </div>
            <div className="col-xl-5">
              <div className="content-heading"><div><h3>Recent reports</h3><p>Latest updates from the community.</p></div></div>
              <ReportList reports={reports} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
