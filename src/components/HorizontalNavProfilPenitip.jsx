import React, { useState } from "react";
import { FaUser, FaHistory, FaReceipt, FaBars, FaTimes, FaBoxOpen, FaHandPaper, FaCalendarPlus, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Logout } from "../api/AuthApi";

const HorizontalNavProfilPenitip = ({
  activeKey,
  onSelect,
  hasSelectedTransaction = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleNav = () => setIsOpen(!isOpen);
  
  const handleLogout = async () => {
    try {
      await Logout();
      navigate('/LoginPage');
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: Clear localStorage and redirect even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate('/LoginPage');
    }
  };

  const navItems = [
    { key: "profile", icon: <FaUser />, label: "Data Profil" },
    { key: "penitipan", icon: <FaBoxOpen />, label: "Penitipan Barang" },
    { key: "request-pengambilan", icon: <FaHandPaper />, label: "Request Pengambilan" },
    { key: "request-perpanjangan", icon: <FaCalendarPlus />, label: "Request Perpanjangan" },
    { key: "history", icon: <FaHistory />, label: "Riwayat Transaksi" },
  ];

  if (hasSelectedTransaction) {
    navItems.push({ key: "detail", icon: <FaReceipt />, label: "Detail Transaksi" });
  }

  return (
    <nav
      className="bg-white shadow-sm border-bottom d-flex align-items-center px-3"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        height: "60px",
      }}
      aria-label="Profil Penitip navigation"
    >
      {/* Toggle button */}
      <button
        onClick={toggleNav}
        className="btn btn-light d-flex align-items-center me-3"
        aria-label={isOpen ? "Sembunyikan label" : "Tampilkan label"}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Nav items */}
      <ul className="nav flex-row flex-grow-1 gap-3 mb-0" role="tablist">
        {navItems.map(({ key, icon, label }) => (
          <li key={key} className="nav-item" role="presentation">
            <button
              className={`btn nav-link d-flex align-items-center px-3 py-2 rounded ${
                activeKey === key
                  ? "bg-success text-white"
                  : "text-dark"
              }`}
              onClick={() => onSelect && onSelect(key)}
              role="tab"
              aria-selected={activeKey === key}
              aria-controls={`${key}-tabpanel`}
              id={`${key}-tab`}
              type="button"
            >
              {icon}
              {isOpen && <span className="ms-2">{label}</span>}
            </button>
          </li>
        ))}

        {/* Logout button */}
        <li className="nav-item ms-auto" role="presentation">
          <button
            className="btn nav-link d-flex align-items-center px-3 py-2 rounded text-danger"
            onClick={handleLogout}
            aria-label="Logout"
            type="button"
          >
            <FaSignOutAlt />
            {isOpen && <span className="ms-2">Logout</span>}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default HorizontalNavProfilPenitip; 