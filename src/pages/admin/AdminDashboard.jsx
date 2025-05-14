import React from "react";
import AdminSidebar from "../../components/AdminSidebar";

const AdminDashboard = () => {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <h3>Selamat datang di Dashboard Admin</h3>
        <p>Silakan pilih menu di sidebar untuk mengelola pegawai dan organisasi.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;