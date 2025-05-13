import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import AdminDashboard from '../pages/admin/AdminDashboard';
import OrganisasiPage from '../pages/admin/OrganisasiPage'; // Import the new OrganisasiPage component
import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
import RegisterPembeli from '../pages/auth/RegisterPembeli';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="organisasi" element={<OrganisasiPage />} /> {/* Child route for OrganisasiPage */}
          {/* Add more child routes as needed */}
        </Route>
        <Route path="/register/organisasi" element={<RegisterOrganisasi />} />
        <Route path="/register/pembeli" element={<RegisterPembeli />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;