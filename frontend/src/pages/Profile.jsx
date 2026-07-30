import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import ReportCard from "../components/ReportCard";

const EMPTY_PROFILE = {
  full_name: "",
  email: "",
  phone: "",
  ward: "",
  area: "",
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [fixedReports, setFixedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    if (!localStorage.getItem("moholla_token")) {
      navigate("/login");
      return undefined;
    }

    api.get("/profile")
      .then((res) => {
        if (!isCurrent) return;
        setProfile({ ...EMPTY_PROFILE, ...res.data.user });
        setSubmittedReports(res.data.submitted_reports || []);
        setFixedReports(res.data.fixed_reports || []);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("moholla_user");
          localStorage.removeItem("moholla_token");
          window.dispatchEvent(new Event("moholla-auth-change"));
          navigate("/login");
          return;
        }
        if (isCurrent) {
          setFeedback({ type: "error", message: err.response?.data?.message || "Could not load profile." });
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  function handleChange(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await api.put("/profile", profile);
      setProfile({ ...EMPTY_PROFILE, ...res.data.user });
      localStorage.setItem("moholla_user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("moholla-auth-change"));
      setFeedback({ type: "success", message: res.data.message });
    } catch (err) {
      setFeedback({ type: "error", message: err.response?.data?.message || "Could not update profile." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="container-xl profile-page"><p>Loading your dashboard…</p></main>;
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="container-xl">
          <div className="profile-identity">
            <div className="profile-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-5 0-8 2.6-8 5.25C4 20.22 4.78 21 5.75 21h12.5c.97 0 1.75-.78 1.75-1.75C20 16.6 17 14 12 14Z" />
              </svg>
            </div>
            <div>
              <p className="section-label">Community profile</p>
              <h1>{profile.full_name}</h1>
              <p>{profile.area || "Neighborhood member"}{profile.ward ? ` · Ward ${profile.ward}` : ""}</p>
            </div>
          </div>
          <div className="profile-stats">
            <div><strong>{submittedReports.length}</strong><span>Reports submitted</span></div>
            <div><strong>{fixedReports.length}</strong><span>Issues marked fixed</span></div>
          </div>
        </div>
      </section>

      <div className="container-xl profile-content">
        <section className="card profile-edit-card">
          <div className="profile-section-heading">
            <div><p className="section-label">Account details</p><h2>Edit your information</h2></div>
          </div>
          <form className="profile-form" onSubmit={handleSave}>
            <label>Full name<input name="full_name" value={profile.full_name} onChange={handleChange} required /></label>
            <label>Email<input type="email" name="email" value={profile.email} onChange={handleChange} required /></label>
            <label>Phone<input type="tel" name="phone" value={profile.phone} onChange={handleChange} required /></label>
            <label>Ward<input name="ward" value={profile.ward || ""} onChange={handleChange} /></label>
            <label className="profile-field-wide">Area<input name="area" value={profile.area || ""} onChange={handleChange} /></label>
            {feedback && <p className={`profile-feedback ${feedback.type}`} role="status">{feedback.message}</p>}
            <div className="profile-field-wide"><button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
          </form>
        </section>

        <ProfileReportSection
          title="Reports you submitted"
          description="Issues you personally added to the public record."
          reports={submittedReports}
          emptyMessage="You have not submitted a report yet."
        />
        <ProfileReportSection
          title="Reports you marked fixed"
          description="Issues where you provided a verified fixed-status update."
          reports={fixedReports}
          emptyMessage="You have not marked any reports as fixed yet."
        />
      </div>
    </main>
  );
}

function ProfileReportSection({ title, description, reports, emptyMessage }) {
  return (
    <section className="profile-reports-section">
      <div className="profile-section-heading">
        <div><h2>{title}</h2><p>{description}</p></div>
        <span className="count-badge">{reports.length}</span>
      </div>
      {reports.length ? (
        <div className="profile-report-grid">
          {reports.map((report) => <ReportCard key={report.id} report={report} />)}
        </div>
      ) : (
        <div className="empty-state">
          <strong>{emptyMessage}</strong>
          <p><Link to="/report/new">Report a neighborhood issue</Link> when you spot one.</p>
        </div>
      )}
    </section>
  );
}
