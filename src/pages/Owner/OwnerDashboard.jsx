import React from "react";
import OwnerSideBar from "../../components/OwnerSideBar";

const AdminDashboard = () => {
  return (
    <div className="d-flex">
      <OwnerSideBar />
      <div className="p-4 w-100">
        <h3>Selamat datang di Dashboard, Pak Raka</h3>
        <p>Silakan pilih menu di sidebar untuk memilih menu.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;