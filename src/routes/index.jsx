import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import InformasiUmum from "../pages/client/InformasiUmum";
import LoginPage from '../pages/auth/LoginPage';
import RegisterPembeli from '../pages/auth/RegisterPembeli';
import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
import RegisterPenitip from '../pages/auth/RegisterPenitip';
import DashboardProfilPembeli from '../pages/client/DashboardProfilPembeli';
import DashboardProfilPenitip from '../pages/client/DashboardProfilPenitip';
import CRUDPenitip from '../pages/auth/CRUDPenitip';
import DashboardOrganisasi from '../pages/client/DashboardOrganisasi';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PegawaiManagement from "../pages/admin/PegawaiManagement";
import OrganisasiManagement from "../pages/admin/OrganisasiManagement";
import MerchandiseManagement from '../pages/admin/MerchandiseManagement';
import AlamatForm from '../components/AlamatForm';
import DashboardKeranjang from '../pages/client/DashboardKeranjang';
import Transaksi from '../pages/client/Transaksi';
import Pembayaran from '../pages/client/Pembayaran';
import VerifikasiPembayaranCS from '../pages/cs/VerifikasiPembayaranCS';
import DonasiManagement from "../pages/owner/DonasiManagement";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import RiwayatAlokasiDonasi from '../pages/owner/RiwayatAlokasiDonasi';
import NotaDonasi from '../pages/owner/NotaDonasi';
import RequestDonasiPage from '../pages/owner/RequestDonasiPage';
import LaporanStokGudangPage from '../pages/owner/LaporanStokGudangPage';
import LaporanPenjualanPage from '../pages/owner/LaporanPenjualanPage';
import LaporanKomisiPage from '../pages/owner/LaporanKomisiPage';
import PegawaiGudangDashboard from '../pages/pegawaiGudang/PegawaiGudangDashboard';
import PenitipanManagement from '../pages/pegawaiGudang/PenitipanManagement';
import NotaDonasiPrint from '../components/Nota/NotaDonasiPrint';
import NotaDonasiAll from '../components/Nota/NotaDonasiAll';
import PenitipanBarangForm from '../components/PegawaiGudangComponents/PenitipanForm';
import BarangForm from '../components/PegawaiGudangComponents/BarangForm';
import DetailBarangPage from '../pages/pegawaiGudang/DetailBarangPage';
import NotaPenitipanPrint from '../components/Nota/NotePenitipan';
import NotaPenjualanKurir from '../components/Nota/NotaPenjualanKurir';
import NotaPenjualanPembeli from '../components/Nota/NotaPenjualanPembeli';
import DashboardPenitip from '../pages/client/DashboardPenitip';
import DaftarBarangPenitip from '../pages/client/DaftarBarangPenitip';
import PengambilanBarang from '../pages/client/PengambilanBarang';
import LaporanTransaksiPenitip from '../pages/client/LaporanTransaksiPenitip';
import LaporanTransaksiPenitipPDF from '../components/Nota/LaporanTransaksiPenitipPDF';
import TransaksiPage from '../pages/pegawaiGudang/TransaksiPage';
import PenjadwalanPage from '../pages/pegawaiGudang/PenjadwalanPage';
import RequestPengambilanPage from '../pages/pegawaiGudang/RequestPengambilanPage';
import ListRequestDonasi from '../components/OwnerComponents/ListRequestDonasi';
import RequestDonasiAll from '../components/Nota/RequestDonasiAll';
import RequestDonasiDetail from '../components/Nota/RequestDonasiDetail';
import KurirDeliveryTrackingPage from '../pages/pegawaiGudang/KurirDeliveryTrackingPage';
import CSDashboard from '../pages/cs/CSDashboard';
import KlaimMerchandiseManagement from '../pages/cs/KlaimMerchandiseManagement';
import DiskusiBarangCS from '../pages/cs/DiskusiBarangCS';
import RiwayatTransaksiPenitipan from '../pages/pegawaiGudang/RiwayatTransaksiPenitipan';

const AppRoutes = () => {
  return (  
    <Router>
      <Routes>
        <Route path="/kategori/:kategori" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/informasi" element={<InformasiUmum />} />
        <Route path="/LoginPage" element={<LoginPage/>} />
        <Route path="/RegisterPembeli" element={<RegisterPembeli/>} />
        <Route path="/RegisterOrganisasi" element={<RegisterOrganisasi/>} />
        <Route path="/RegisterPenitip" element={<RegisterPenitip/>} />
        <Route path="/DashboardProfilPembeli/:id_user" element={<DashboardProfilPembeli />} />
        <Route path="/DashboardProfilPenitip/:id_user" element={<DashboardProfilPenitip />} />
        <Route path="/DashboardOrganisasi" element={<DashboardOrganisasi/>} />
        <Route path="/DashboardPenitip" element={<DashboardPenitip/>} />
        <Route path="/DashboardBarangPenitip" element={<DaftarBarangPenitip/>} />
        <Route path="/DashboardPenitip/pengambilan-barang" element={<PengambilanBarang/>} />
        <Route path="/DashboardPenitip/laporan-pendapatan" element={<LaporanTransaksiPenitip/>} />
        <Route path="/DashboardPenitip/laporan-pendapatan/print" element={<LaporanTransaksiPenitipPDF/>} />
        <Route path="/keranjang/:userId?" element={<DashboardKeranjang/>} />
        <Route path="/transaksi" element={< Transaksi />} />
        <Route path="/pembayaran" element={< Pembayaran />} />
        <Route path="/VerifikasiPembayaranCS" element={< VerifikasiPembayaranCS />} />
        <Route path="/CRUDPenitip" element={<CRUDPenitip/>} />
        <Route path="/DashboardAdmin" element={<AdminDashboard />} />
        <Route path="/admin/pegawai" element={<PegawaiManagement />} />
        <Route path="/admin/organisasi" element={<OrganisasiManagement />} />
        <Route path="/admin/merchandise" element={<MerchandiseManagement />} />
        <Route path='/DashboardOwner' element={< OwnerDashboard />} />
        <Route path='/owner/donasi' element={< DonasiManagement />} />
        <Route path='/owner/alokasi' element={< RiwayatAlokasiDonasi />} />
        <Route path='/owner/nota-donasi' element={< NotaDonasi />} />
        <Route path='/owner/nota-donasi/print/:id_alokasi' element={< NotaDonasiPrint />} />
        <Route path='/owner/nota-donasi/print-all' element={< NotaDonasiAll />} />
        <Route path='/owner/request-donasi' element={< RequestDonasiPage />} />
        <Route path='/owner/request-donasi/print-all' element={< RequestDonasiAll />} />
        <Route path='/owner/request-donasi/detail/:id_request' element={< RequestDonasiDetail />} />
        <Route path='/owner/laporan-transaksi' element={< LaporanTransaksiPenitip />} />
        <Route path='/owner/laporan-transaksi/print' element={< LaporanTransaksiPenitipPDF />} />
        <Route path='/alamat/pembeli' element={< AlamatForm />} />
        <Route path='/DashboardPegawaiGudang' element={< PegawaiGudangDashboard />} />
        <Route path='/pegawaiGudang/penitipan' element={< PenitipanManagement />} />
        <Route path='/pegawaiGudang/transaksi' element={< TransaksiPage />} />
        <Route path='/pegawaiGudang/penjadwalan' element={< PenjadwalanPage />} />
        <Route path='/pegawaiGudang/kurirDelivery' element={< KurirDeliveryTrackingPage />} />
        <Route path='/pegawaiGudang/requestPengambilan' element={< RequestPengambilanPage />} />
        <Route path='/owner/laporan-stok' element={< LaporanStokGudangPage />} />
        <Route path='/owner/laporan-penjualan' element={< LaporanPenjualanPage />} />
        <Route path='/owner/laporan-komisi' element={< LaporanKomisiPage />} />
        <Route path='/alamat/pembeli' element={< AlamatForm />} />
        <Route path='/DashboardPegawaiGudang' element={< PegawaiGudangDashboard />} />
        <Route path='/pegawaiGudang/penitipan' element={< PenitipanManagement />} />
        <Route path='/pegawaiGudang/riwayat-transaksi' element={< RiwayatTransaksiPenitipan />} />
        <Route path="/barang/:id" element={<DetailBarangPage />} />
        <Route path='/pegawaiGudang/form-penitipan' element={< PenitipanBarangForm />} />
        <Route path='/pegawaiGudang/form-barang' element={< BarangForm />} />
        <Route path='/pegawaiGudang/nota-penitipan/print' element={< NotaPenitipanPrint />} />
        <Route path='/pegawaiGudang/nota-pengiriman/:id_jadwal' element={< NotaPenjualanKurir />} />
        <Route path='/pegawaiGudang/nota-pengambilan/:id_jadwal' element={< NotaPenjualanPembeli />} />
        <Route path='/DashboardCS' element={<CSDashboard />} />
        <Route path='/cs/klaim-merchandise' element={<KlaimMerchandiseManagement />} />
        <Route path='/cs/diskusi-barang' element={<DiskusiBarangCS />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;