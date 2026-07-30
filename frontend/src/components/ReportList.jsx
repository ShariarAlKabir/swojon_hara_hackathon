import ReportCard from "./ReportCard";

export default function ReportList({ reports }) {
  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <strong>No reports match these filters</strong>
        <p>Try another ward, category, or status.</p>
      </div>
    );
  }

  return <div className="report-list">{reports.map((report) => <ReportCard key={report.id} report={report} />)}</div>;
}
