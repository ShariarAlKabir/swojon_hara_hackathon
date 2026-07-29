import { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../components/Header";
import ReportList from "../components/ReportList";
import MapView from "../components/MapView";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ category: "", status: "", ward: "" });

  async function loadReports() {
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/reports?${params.toString()}`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadReports();
  }, [filters.category, filters.status, filters.ward]);

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="hero-title">Neighborhood issues, made visible</h1>
        <p className="hero-copy">Browse local reports, filter by ward or status, and help turn scattered complaints into visible civic pressure.</p>

        <div className="toolbar">
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            <option value="pothole">Pothole</option>
            <option value="flooding">Flooding</option>
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
            <option value="open_manhole">Open manhole</option>
            <option value="other">Other</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="reported">Reported</option>
            <option value="in_progress">In progress</option>
            <option value="fixed">Fixed</option>
          </select>
          <input placeholder="Ward" value={filters.ward} onChange={(e) => setFilters({ ...filters, ward: e.target.value })} />
        </div>

        <div className="grid">
          <MapView reports={reports} />
          <ReportList reports={reports} />
        </div>
      </div>
    </div>
  );
}