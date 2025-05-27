import React from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import LaporanStokGudang from "../../components/Laporan/LaporanStokGudang";

const LaporanStokGudangPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="flex-grow-1">
        <LaporanStokGudang />
      </div>
    </div>
  );
};

export default LaporanStokGudangPage; 