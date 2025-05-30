import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import LaporanKomisiBulanan from "../../components/Laporan/LaporanKomisiBulanan";

const LaporanKomisiPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        <h2 className="mb-4">Laporan Komisi Bulanan Per Produk</h2>
        <LaporanKomisiBulanan />
      </div>
    </div>
  );
};

export default LaporanKomisiPage; 