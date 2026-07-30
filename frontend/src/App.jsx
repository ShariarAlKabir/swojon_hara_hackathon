import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";
import ReportDetail from "./pages/ReportDetail";
import WardDashboard from "./pages/WardDashboard";
import AuthPage from "./pages/AuthPage";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/report/new" element={<CreateReport />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/dashboard" element={<WardDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
