import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ReportForm from "../components/ReportForm";

export default function CreateReport() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("moholla_user");
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div>
      <Header />
      <div className="container">
        <h1 className="hero-title">Submit a report</h1>
        <p className="hero-copy">Share a photo-backed issue, pin its location, and start building public pressure around it.</p>
        <div className="card" style={{ marginTop: "20px" }}>
          <ReportForm />
        </div>
      </div>
    </div>
  );
}
