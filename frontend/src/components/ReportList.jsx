import ReportCard from "./ReportCard";

export default function ReportList({ reports }) {
  return <div className="report-list">{reports.map((report) => <ReportCard key={report.id} report={report} />)}</div>;
}
