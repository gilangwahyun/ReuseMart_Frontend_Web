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
import DonasiManagement from "../pages/owner/DonasiManagement";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import RiwayatAlokasiDonasi from '../pages/owner/RiwayatAlokasiDonasi';
import PegawaiGudangDashboard from '../pages/pegawaiGudang/PegawaiGudangDashboard';
import PenitipanManagement from '../pages/pegawaiGudang/PenitipanManagement';
import PenitipanBarangForm from '../components/PegawaiGudangComponents/PenitipanForm';
import BarangForm from '../components/PegawaiGudangComponents/BarangForm';
import DetailBarangPage from '../pages/pegawaiGudang/DetailBarangPage';
import NotaPenitipanPrint from '../components/Nota/NotePenitipan';

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
        <Route path='/DashboardPegawaiGudang' element={< PegawaiGudangDashboard />} />
        <Route path='/pegawaiGudang/penitipan' element={< PenitipanManagement />} />
        <Route path="/barang/:id" element={<DetailBarangPage />} />
        <Route path='/pegawaiGudang/form-penitipan' element={< PenitipanBarangForm />} />
        <Route path='/pegawaiGudang/form-barang' element={< BarangForm />} />
        <Route path='/pegawaiGudang/nota-penitipan/print' element={< NotaPenitipanPrint />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;