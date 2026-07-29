import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";
import ReportDetail from "./pages/ReportDetail";
import WardDashboard from "./pages/WardDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report/new" element={<CreateReport />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/dashboard" element={<WardDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
