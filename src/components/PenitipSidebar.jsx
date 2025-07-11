import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaBoxOpen,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaExchangeAlt,
  FaHandPaper,
} from "react-icons/fa";
import { Logout } from "../api/AuthApi";

const PenitipSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await Logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarItems = [
    { to: "/DashboardPenitip", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/DashboardPenitip/daftar-barang", icon: <FaBoxOpen />, label: "Daftar Barang" },
    { to: "/DashboardPenitip/pengambilan-barang", icon: <FaHandPaper />, label: "Pengambilan Barang" }
  ];

  return (
    <div
      className={`bg-white border-end shadow-sm d-flex flex-column justify-between`}
      style={{
        width: isOpen ? "220px" : "70px",
        transition: "width 0.3s",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        {isOpen && <h5 className="mb-0 text">Penitip Panel</h5>}
        <button
          className="btn btn-sm btn-light border"
          onClick={toggleSidebar}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-grow-1 overflow-auto">
        <ul className="nav flex-column mt-2">
          {sidebarItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link
                to={item.to}
                className={`nav-link d-flex align-items-center py-3 px-3 ${
                  location.pathname === item.to ? "active text-primary" : "text-secondary"
                }`}
              >
                <span className="fs-5 me-3">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer - Logout */}
      <div className="p-3 border-top">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger d-flex align-items-center"
          style={{ width: isOpen ? "100%" : "auto" }}
        >
          <FaSignOutAlt />
          {isOpen && <span className="ms-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default PenitipSidebar;
