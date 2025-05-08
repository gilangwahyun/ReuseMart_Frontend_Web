import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { FaBars } from "react-icons/fa";

const AdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <nav className="bg-white shadow px-6 py-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 mr-4"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
          >
            <FaBars size={22} />
          </button>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </nav>

        <main className="p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="text-gray-700">Kelola semua tugas administratif di sini.</p>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
