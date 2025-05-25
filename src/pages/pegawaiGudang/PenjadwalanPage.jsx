import React from "react";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSidebar";
import JadwalList from "../../components/PegawaiGudangComponents/JadwalList";

const PenjadwalanPage = () => {
  return (
    <div className="d-flex">
      <PegawaiGudangSideBar />
      <div className="w-100">
        <JadwalList />
      </div>
    </div>
  );
};

export default PenjadwalanPage; 