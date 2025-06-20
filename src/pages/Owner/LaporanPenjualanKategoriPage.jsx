import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import LaporanPenjualanKategori from "../../components/Laporan/LaporanPenjualanKategori";

const LaporanPenjualanKategoriPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        <h2 className="mb-4">Laporan Penjualan per Kategori Barang</h2>
        <LaporanPenjualanKategori />
      </div>
    </div>
  );
};

export default LaporanPenjualanKategoriPage; 