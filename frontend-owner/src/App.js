import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Page Components
import OwnerLogin from "./pages/OwnerLogin";
import RegisterPage1 from "./pages/RegisterPage1";
import BusinessSetupWizard from "./pages/BusinessSetupWizard";
import ModernDashboard from "./pages/ModernDashboard";
import SalonCalendar from "./pages/SalonCalendar"; // ✅ Import Calendar Page
import SalonServices from './pages/SalonServices';
import OwnerFeedbackPage from "./pages/OwnerFeedbackPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<OwnerLogin />} />

        {/* Registration Flow */}
        <Route path="/register" element={<RegisterPage1 />} />
        <Route path="/register-step-2" element={<BusinessSetupWizard />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ModernDashboard />} />

        {/* Calendar Page */}
        <Route path="/calendar" element={<SalonCalendar />} />

        <Route path="/services" element={<SalonServices />} />

        <Route path="/feedbacks" element={<OwnerFeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
