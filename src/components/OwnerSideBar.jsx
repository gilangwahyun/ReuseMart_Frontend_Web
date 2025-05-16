import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaBuilding,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { Logout } from "../api/AuthApi";

const OwnerSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
    { to: "/DashboardOwner", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/owner/donasi", icon: <FaUserTie />, label: "Request Donasi dan Alokasi" },
    { to: "/owner/alokasi", icon: <FaBuilding />, label: "Riwayat Alokasi" },
    { to: "/owner/organisasi", icon: <FaBuilding />, label: "Organisasi" },
  ];

  return (
    <div className="d-flex">
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
          {sidebarItems.map(({ to, icon, label }) => (
            <li className="nav-item mb-2" key={to}>
              <Link to={to} className="nav-link text-dark d-flex align-items-center">
                {icon}
                {isOpen && <span className="ms-2">{label}</span>}
              </Link>
            </li>
          ))}
          {/* Tombol Logout */}
          <li className="nav-item mb-2">
            <button
              className="nav-link text-dark d-flex align-items-center"
              onClick={handleLogout}
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <FaSignOutAlt />
              {isOpen && <span className="ms-2">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OwnerSidebar;