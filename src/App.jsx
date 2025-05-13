import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import AdminDashboard from '../pages/admin/AdminDashboard';
import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
import OrganisasiAdmin from '../pages/admin/OrganisasiPage.jsx';
import RegisterPembeli from '../pages/auth/RegisterPembeli';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/admin/organisasi" element={<RegisterOrganisasi />} />
        <Route path="/register/pembeli" element={<RegisterPembeli />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
