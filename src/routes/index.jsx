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
import AlamatForm from '../components/AlamatForm';
import DashboardKeranjang from '../pages/client/DashboardKeranjang';
import DonasiManagement from "../pages/owner/DonasiManagement";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import RiwayatAlokasiDonasi from '../pages/owner/RiwayatAlokasiDonasi';
import PegawaiGudangDashboard from '../pages/pegawaiGudang/PegawaiGudangDashboard';
import PenitipanManagement from '../pages/pegawaiGudang/PenitipanManagement';
import PenitipanBarangForm from '../components/PegawaiGudangComponents/PenitipanForm';
import BarangForm from '../components/PegawaiGudangComponents/BarangForm';
import DetailBarangPage from '../pages/pegawaiGudang/DetailBarangPage';
import NotaPenitipanPrint from '../components/Nota/NotePenitipan';
import NotaPenjualanKurir from '../components/Nota/NotaPenjualanKurir';
import NotaPenjualanPembeli from '../components/Nota/NotaPenjualanPembeli';
import DashboardPenitip from '../pages/client/DashboardPenitip';
import DaftarBarangPenitip from '../pages/client/DaftarBarangPenitip';
import TransaksiPage from '../pages/pegawaiGudang/TransaksiPage';
import PenjadwalanPage from '../pages/pegawaiGudang/PenjadwalanPage';
import RequestPengambilanPage from '../pages/pegawaiGudang/RequestPengambilanPage';

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
        <Route path="/DashboardProfilPembeli/:id_user" element={<DashboardProfilPembeli />} />
        <Route path="/DashboardOrganisasi" element={<DashboardOrganisasi/>} />
        <Route path="/DashboardPenitip" element={<DashboardPenitip/>} />
        <Route path="/DashboardPenitip/daftar-barang" element={<DaftarBarangPenitip/>} />
        <Route path="/keranjang/:userId?" element={<DashboardKeranjang/>} />
        <Route path="/CRUDPenitip" element={<CRUDPenitip/>} />
        <Route path="/DashboardAdmin" element={<AdminDashboard />} />
        <Route path="/admin/pegawai" element={<PegawaiManagement />} />
        <Route path="/admin/organisasi" element={<OrganisasiManagement />} />
        <Route path='/DashboardOwner' element={< OwnerDashboard />} />
        <Route path='/owner/donasi' element={< DonasiManagement />} />
        <Route path='/owner/alokasi' element={< RiwayatAlokasiDonasi />} />
        <Route path='/alamat/pembeli' element={< AlamatForm />} />
        <Route path='/DashboardPegawaiGudang' element={< PegawaiGudangDashboard />} />
        <Route path='/pegawaiGudang/penitipan' element={< PenitipanManagement />} />
        <Route path='/pegawaiGudang/transaksi' element={< TransaksiPage />} />
        <Route path='/pegawaiGudang/penjadwalan' element={< PenjadwalanPage />} />
        <Route path='/pegawaiGudang/requestPengambilan' element={< RequestPengambilanPage />} />
        <Route path="/barang/:id" element={<DetailBarangPage />} />
        <Route path='/pegawaiGudang/form-penitipan' element={< PenitipanBarangForm />} />
        <Route path='/pegawaiGudang/form-barang' element={< BarangForm />} />
        <Route path='/pegawaiGudang/nota-penitipan/print' element={< NotaPenitipanPrint />} />
        <Route path='/pegawaiGudang/nota-pengiriman/:id_jadwal' element={< NotaPenjualanKurir />} />
        <Route path='/pegawaiGudang/nota-pengambilan/:id_jadwal' element={< NotaPenjualanPembeli />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;