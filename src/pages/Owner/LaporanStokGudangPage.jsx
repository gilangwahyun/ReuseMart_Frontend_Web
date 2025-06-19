import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import LaporanStokGudang from "../../components/Laporan/LaporanStokGudang";

const LaporanStokGudangPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        <h2 className="mb-4">Laporan Stok Gudang</h2>
        <LaporanStokGudang />
      </div>
    </div>
  );
};

export default LaporanStokGudangPage; 