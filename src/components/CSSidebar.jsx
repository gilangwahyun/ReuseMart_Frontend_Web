import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserTie,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaGift,
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
    { to: "/cs/klaim-merchandise", icon: <FaGift />, label: "Klaim Merchandise" },
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

      {/* Navigation */}
      <ul className="nav flex-column p-2 flex-grow-1">
        {sidebarItems.map(({ to, icon, label }) => (
          <li className="nav-item" key={to}>
            <Link
              to={to}
              className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                location.pathname === to ? "bg-success text-white" : "text-dark"
              }`}
              style={{ transition: "0.2s" }}
            >
              {icon}
              {isOpen && <span className="ms-2">{label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="p-2 border-top">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          {isOpen && <span className="ms-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default CSSidebar;
