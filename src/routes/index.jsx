import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import LoginPage from '../pages/auth/LoginPage';
import DashboardProfilPembeli from '../pages/client/DashboardProfilPembeli';
import CRUDPenitip from '../pages/auth/CRUDPenitip';
import DashboardOrganisasi from '../pages/client/DashboardOrganisasi';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PegawaiManagement from "../pages/admin/PegawaiManagement";
import OrganisasiManagement from "../pages/admin/OrganisasiManagement";
import DonasiManagement from "../pages/Owner/DonasiManagement";
import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import RiwayatAlokasiDonasi from '../pages/Owner/RiwayatAlokasiDonasi';

const AppRoutes = () => {
  return (  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/LoginPage" element={<LoginPage/>} />
        <Route path="/DashboardProfilPembeli" element={<DashboardProfilPembeli/>} />
        <Route path="/DashboardOrganisasi" element={<DashboardOrganisasi/>} />
        <Route path="/CRUDPenitip" element={<CRUDPenitip/>} />
        <Route path="/DashboardAdmin" element={<AdminDashboard />} />
        <Route path="/admin/pegawai" element={<PegawaiManagement />} />
        <Route path="/admin/organisasi" element={<OrganisasiManagement />} />
        <Route path='/DashboardOwner' element={< OwnerDashboard />} />
        <Route path='/owner/donasi' element={< DonasiManagement />} />
        <Route path='/owner/alokasi' element={< RiwayatAlokasiDonasi />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;