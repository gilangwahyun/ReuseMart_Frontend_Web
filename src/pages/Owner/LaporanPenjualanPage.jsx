import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import LaporanPenjualan from "../../components/Laporan/LaporanPenjualan";

const LaporanPenjualanPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        <h2 className="mb-4">Laporan Penjualan Bulanan</h2>
        <LaporanPenjualan />
      </div>
    </div>
  );
};

export default LaporanPenjualanPage; 