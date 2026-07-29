import ReportForm from "../components/ReportForm";

export default function CreateReport() {
  return (
    <div className="container">
      <h1 className="hero-title">Submit a report</h1>
      <p className="hero-copy">Share a photo-backed issue, pin its location, and start building public pressure around it.</p>
      <div className="card" style={{ marginTop: "20px" }}>
        <ReportForm />
      </div>
    </div>
  );
}
