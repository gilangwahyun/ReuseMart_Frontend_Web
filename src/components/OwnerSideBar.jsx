import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserTie, FaBuilding, FaTachometerAlt, FaBars, FaTimes, FaMoneyBill } from "react-icons/fa";

const OwnerSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

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
            <Link to="/owner/donasi" className="nav-link text-dark d-flex align-items-center">
              <FaMoneyBill className="me-2" />
              {isOpen && "Manajerial Donasi"}
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/owner/alokasi" className="nav-link text-dark d-flex align-items-center">
              <FaMoneyBill className="me-2" />
              {isOpen && "Manajerial Alokasi Donasi"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OwnerSidebar;