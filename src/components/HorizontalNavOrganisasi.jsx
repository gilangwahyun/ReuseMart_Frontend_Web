import React, { useState } from "react";
import { FaUser, FaClipboardList, FaPlus, FaChartBar, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Logout } from "../api/AuthApi";

const HorizontalNavOrganisasi = ({
  activeKey,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleNav = () => setIsOpen(!isOpen);
  
  const handleLogout = async () => {
    try {
      await Logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
    { key: "profile", icon: <FaUser />, label: "Profil Organisasi" },
    { key: "list-request", icon: <FaClipboardList />, label: "Daftar Request Donasi" },
    { key: "create-request", icon: <FaPlus />, label: "Buat Request Donasi" },
    { key: "statistics", icon: <FaChartBar />, label: "Statistik Donasi" },
  ];

  return (
    <div className="nav-profil-container mb-4">
      <nav
        className="bg-white shadow-sm rounded-3 d-flex align-items-center px-3 py-2"
        style={{
          zIndex: 999,
        }}
        aria-label="Organisasi navigation"
      >
        {/* Toggle button */}
        <button
          onClick={toggleNav}
          className="btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center me-3"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%"
          }}
          aria-label={isOpen ? "Sembunyikan label" : "Tampilkan label"}
        >
          {isOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
        </button>

        {/* Nav items */}
        <ul className="nav flex-row flex-grow-1 gap-2 mb-0" role="tablist">
          {navItems.map(({ key, icon, label }) => (
            <li key={key} className="nav-item" role="presentation">
              <button
                className={`btn nav-link d-flex align-items-center px-3 py-2 rounded-pill transition-all ${
                  activeKey === key
                    ? "bg-success text-white shadow-sm"
                    : "text-dark hover-effect"
                }`}
                onClick={() => onSelect && onSelect(key)}
                role="tab"
                aria-selected={activeKey === key}
                aria-controls={`${key}-tabpanel`}
                id={`${key}-tab`}
                type="button"
                style={{ transition: "all 0.2s ease" }}
              >
                <span className="icon-wrapper">{icon}</span>
                {isOpen && <span className="ms-2">{label}</span>}
              </button>
            </li>
          ))}

          {/* Logout button */}
          <li className="nav-item ms-auto" role="presentation">
            <button
              className="btn nav-link d-flex align-items-center px-3 py-2 rounded-pill text-danger hover-effect"
              onClick={handleLogout}
              aria-label="Keluar"
              type="button"
              style={{ transition: "all 0.2s ease" }}
            >
              <span className="icon-wrapper"><FaSignOutAlt /></span>
              {isOpen && <span className="ms-2">Keluar</span>}
            </button>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        .hover-effect:hover {
          background-color: #f8f9fa;
        }
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default HorizontalNavOrganisasi; 