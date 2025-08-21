import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';


import Home from './pages/HomePage';
import LoginSelection from './pages/LoginSelection';
import CustomerLogin from './pages/Login';
import Searchsalon from './pages/searchsalon';
import Profile from './pages/Profile';
import SelectServicesPage from './pages/SelectServicesPage';
import SelectProfessionalPage from './pages/SelectProfessionalPage';
import SelectTimePage from './pages/SelectTimePage';
import MyAppointmentsPage from "./pages/MyAppointmentsPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSelection />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/searchsalon" element={<Searchsalon />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/select-services/:salonId" element={<SelectServicesPage />} />
        <Route path="/select-professional/:salonId" element={<SelectProfessionalPage />} />
        <Route path="/select-time" element={<SelectTimePage />} />
        <Route path="/appointments" element={<MyAppointmentsPage />} />
       

      </Routes>
    </Router>
  );
}

export default App;
