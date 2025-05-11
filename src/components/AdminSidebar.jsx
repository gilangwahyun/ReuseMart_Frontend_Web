import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUserTie,
  FaBoxOpen,
  FaUsers,
  FaShoppingCart,
  FaBuilding,
  FaDonate,
  FaHome,
  FaBars, // Icon for the toggle button
} from "react-icons/fa";

const sidebarItems = [
  { to: "/admin/dashboard", icon: <FaHome />, label: "Dashboard" },
  { to: "/admin/pegawai", icon: <FaUserTie />, label: "Pegawai" },
  { to: "/admin/barang-titipan", icon: <FaBoxOpen />, label: "Barang Titipan" },
  { to: "/admin/penitip", icon: <FaUsers />, label: "Penitip" },
  { to: "/admin/pembeli", icon: <FaShoppingCart />, label: "Pembeli" },
  { to: "/admin/organisasi", icon: <FaBuilding />, label: "Organisasi" },
  { to: "/admin/donasi", icon: <FaDonate />, label: "Donasi" },
];

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 p-2 bg-blue-600 text-white rounded-md shadow-md"
        aria-label="Toggle Sidebar"
      >
        <FaBars />
      </button>

      <nav
        aria-label="Admin Sidebar"
        className={`bg-white h-screen fixed top-0 left-0 shadow-md transition-all duration-300 ${
          isOpen ? "w-64 pointer-events-auto" : "w-0 overflow-hidden pointer-events-none"
        }`}
        style={{ zIndex: 20 }}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>

        <ul className="p-4 space-y-3">
          {sidebarItems.map(({ to, icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                aria-current={window.location.pathname === to ? "page" : undefined}
              >
                {icon} {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;