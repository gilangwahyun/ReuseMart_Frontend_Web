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


import { FaUserTie, FaBuilding, FaTachometerAlt, FaBars, FaTimes } from "react-icons/fa";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

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
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className={`bg-light border-end p-3 ${isOpen ? "vh-100" : ""}`}
        style={{
          width: isOpen ? "250px" : "60px",
          transition: "width 0.3s",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          {isOpen && <h5 className="mb-0">Administrasi</h5>}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleSidebar}
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/" className="nav-link text-dark d-flex align-items-center">
              <FaTachometerAlt className="me-2" />
              {isOpen && "Dashboard"}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/pegawai" className="nav-link text-dark d-flex align-items-center">
              <FaUserTie className="me-2" />
              {isOpen && "Manajerial Pegawai"}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/organisasi" className="nav-link text-dark d-flex align-items-center">
              <FaBuilding className="me-2" />
              {isOpen && "Manajerial Organisasi"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;