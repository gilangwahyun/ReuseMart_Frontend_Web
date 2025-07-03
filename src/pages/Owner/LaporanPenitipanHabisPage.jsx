import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import LaporanPenitipanHabis from "../../components/Laporan/LaporanPenitipanHabis";

const LaporanPenitipanHabisPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        <h2 className="mb-4">Laporan Barang dengan Masa Penitipan Habis</h2>
        <LaporanPenitipanHabis />
      </div>
    </div>
  );
};

export default LaporanPenitipanHabisPage; 