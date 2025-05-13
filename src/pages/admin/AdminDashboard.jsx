import React from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Outlet } from "react-router-dom"; // Use Outlet for nested routes

const AdminDashboard = () => {
  return (
    <div className="d-flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div
        style={{
          marginLeft: "250px", // Match the sidebar width
          width: "100%", // Ensure it takes the remaining width
        }}
      >
        <nav className="bg-white shadow px-6 py-4 flex items-center">
          <h1 className="text-xl font-semibold" style={{ paddingLeft: "20px" }}>
            Admin Dashboard
          </h1>
        </nav>

        <main className="p-6" style={{ paddingLeft: "20px", paddingTop: "20px" }}>
          <Outlet /> {/* This will render the matched child route */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;