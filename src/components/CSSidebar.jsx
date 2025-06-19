import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyCheckAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaGift,
  FaComments,
} from "react-icons/fa";
import { Logout } from "../api/AuthApi";

const CSSidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Awalnya terbuka
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
    { to: "/DashboardCS", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/VerifikasiPembayaranCS", icon: <FaMoneyCheckAlt />, label: "Verifikasi Pembayaran" },
    { to: "/cs/klaim-merchandise", icon: <FaGift />, label: "Klaim Merchandise" },
    { to: "/cs/diskusi-barang", icon: <FaComments />, label: "Diskusi Barang" },
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
        {isOpen && <h5 className="mb-0 text">CS Panel</h5>}
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
                  location.pathname === item.to ? "bg-success text-white" : "text-dark"
                }`}
                style={{ transition: "0.2s" }}
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
          className="btn btn-outline-danger d-flex align-items-center justify-content-center"
          style={{ width: isOpen ? "100%" : "auto" }}
        >
          <FaSignOutAlt />
          {isOpen && <span className="ms-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default CSSidebar;
