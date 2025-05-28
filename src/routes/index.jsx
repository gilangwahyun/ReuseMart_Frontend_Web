import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import LoginPage from '../pages/auth/LoginPage';
import RegisterPembeli from '../pages/auth/RegisterPembeli';
import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
import RegisterPenitip from '../pages/auth/RegisterPenitip';
import DashboardProfilPembeli from '../pages/client/DashboardProfilPembeli';
import CRUDPenitip from '../pages/auth/CRUDPenitip';
import DashboardOrganisasi from '../pages/client/DashboardOrganisasi';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PegawaiManagement from "../pages/admin/PegawaiManagement";
import OrganisasiManagement from "../pages/admin/OrganisasiManagement";
import DonasiManagement from "../pages/Owner/DonasiManagement";
import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import RiwayatAlokasiDonasi from '../pages/Owner/RiwayatAlokasiDonasi';
import AlamatForm from '../components/AlamatForm';
import DashboardKeranjang from '../pages/client/DashboardKeranjang';
import Transaksi from '../pages/client/Transaksi';
import Pembayaran from '../pages/client/Pembayaran';
import VerifikasiPembayaranCS from '../pages/admin/VerifikasiPembayaranCS';

const AppRoutes = () => {
  return (  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/LoginPage" element={<LoginPage/>} />
        <Route path="/RegisterPembeli" element={<RegisterPembeli/>} />
        <Route path="/RegisterOrganisasi" element={<RegisterOrganisasi/>} />
        <Route path="/RegisterPenitip" element={<RegisterPenitip/>} />
        <Route path="/DashboardProfilPembeli" element={<DashboardProfilPembeli/>} />
        <Route path="/DashboardOrganisasi" element={<DashboardOrganisasi/>} />
        <Route path="/keranjang/:userId?" element={<DashboardKeranjang/>} />
        <Route path="/transaksi" element={< Transaksi />} />
        <Route path="/pembayaran" element={< Pembayaran />} />
        <Route path="/VerifikasiPembayaranCS" element={< VerifikasiPembayaranCS />} />
        <Route path="/CRUDPenitip" element={<CRUDPenitip/>} />
        <Route path="/DashboardAdmin" element={<AdminDashboard />} />
        <Route path="/admin/pegawai" element={<PegawaiManagement />} />
        <Route path="/admin/organisasi" element={<OrganisasiManagement />} />
        <Route path='/DashboardOwner' element={< OwnerDashboard />} />
        <Route path='/owner/donasi' element={< DonasiManagement />} />
        <Route path='/owner/alokasi' element={< RiwayatAlokasiDonasi />} />
        <Route path='/alamat/pembeli' element={< AlamatForm />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;