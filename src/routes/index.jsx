import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import AdminDashboard from '../pages/admin/AdminDashboard';
import OrganisasiPage from '../pages/admin/OrganisasiPage';
import ProfilePenitip from '../pages/client/ProfilePenitip';
import ProfilePembeli from '../pages/client/ProfilePembeli';
import HistoryPenitip from '../pages/client/HistoryPenitip';
import LoginPage from '../pages/auth/LoginPage';
import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
import RegisterPembeli from '../pages/auth/RegisterPembeli';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="organisasi" element={<OrganisasiPage />} />
        </Route>
        <Route path="/penitipanBarang/penitip/:id" element={<HistoryPenitip/>} />
        <Route path="/penitip/profile/:id" element={<ProfilePenitip/>} />
        <Route path="/pembeli/profile/:id" element={<ProfilePembeli/>} />
        <Route path="/register/organisasi" element={<RegisterOrganisasi />} />
        <Route path="/register/pembeli" element={<RegisterPembeli />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;