import React from "react";
import AdminSidebar from "../../components/AdminSidebar";

const OrganisasiManagement = () => {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <h3>Manajerial Organisasi</h3>
        <p>Halaman untuk Create, Read, Update, dan Delete data Organisasi.</p>
        {/* Tambahkan form dan tabel organisasi di sini */}
      </div>
    </div>
  );
};

export default OrganisasiManagement;