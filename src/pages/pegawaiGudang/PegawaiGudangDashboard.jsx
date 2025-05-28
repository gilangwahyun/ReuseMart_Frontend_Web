import React from "react";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSidebar";

const AdminDashboard = () => {
  return (
    <div className="d-flex">
      <PegawaiGudangSideBar />
      <div className="p-4 w-100">
        <h3>Selamat datang di Dashboard Gudang</h3>
        <p>Silakan pilih menu di sidebar untuk memilih menu.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;