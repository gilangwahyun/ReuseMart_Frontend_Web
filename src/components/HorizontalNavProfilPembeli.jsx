import React, { useState } from "react";
import { FaUser, FaHistory, FaReceipt, FaArrowLeft, FaBars, FaTimes, FaHome } from "react-icons/fa";

const HorizontalNavProfilPembeli = ({
  activeKey,
  onSelect,
  hasSelectedTransaction = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNav = () => setIsOpen(!isOpen);
  const handleGoBack = () => window.history.back();

  const navItems = [
    { key: "profile", icon: <FaUser />, label: "Data Profil" },
    { key: "history", icon: <FaHistory />, label: "Riwayat Transaksi" },
    { key: "alamat", icon: <FaHome />, label: "Alamat" },
  ];

  if (hasSelectedTransaction) {
    navItems.push({ key: "detail", icon: <FaReceipt />, label: "Detail Transaksi" });
  }

  return (
    <div className="nav-profil-container mb-4">
      <nav
        className="bg-white shadow-sm rounded-3 d-flex align-items-center px-3 py-2"
        style={{
          zIndex: 999,
        }}
        aria-label="Profil navigation"
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

          {/* Back button */}
          <li className="nav-item ms-auto" role="presentation">
            <button
              className="btn nav-link d-flex align-items-center px-3 py-2 rounded-pill text-dark hover-effect"
              onClick={handleGoBack}
              aria-label="Kembali"
              type="button"
              style={{ transition: "all 0.2s ease" }}
            >
              <span className="icon-wrapper"><FaArrowLeft /></span>
              {isOpen && <span className="ms-2">Kembali</span>}
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

export default HorizontalNavProfilPembeli;