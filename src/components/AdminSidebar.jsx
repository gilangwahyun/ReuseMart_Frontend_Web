import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaBoxOpen,
  FaUsers,
  FaShoppingCart,
  FaBuilding,
  FaDonate,
  FaHome,
} from "react-icons/fa";

const sidebarItems = [
  { to: "/admin", icon: <FaHome />, label: "Dashboard" },
  { to: "/admin/pegawai", icon: <FaUser/>, label: "Pegawai" },
  { to: "/admin/barang-titipan", icon: <FaBoxOpen />, label: "Barang Titipan" },
  { to: "/admin/penitip", icon: <FaUsers />, label: "Penitip" },
  { to: "/admin/pembeli", icon: <FaShoppingCart />, label: "Pembeli" },
  { to: "/admin/organisasi", icon: <FaBuilding />, label: "Organisasi" }, // Link to OrganisasiPage
  { to: "/admin/donasi", icon: <FaDonate />, label: "Donasi" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div
      className="position-fixed top-0 start-0 h-100 bg-light shadow"
      style={{ width: "250px", zIndex: 1020 }}
    >
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        <h2 className="h5 m-0">Admin Panel</h2>
      </div>
      <ul className="list-unstyled flex-grow-1 p-3 overflow-auto">
        {sidebarItems.map(({ to, icon, label }) => (
          <li key={to} className="mb-2">
            <Link
              to={to}
              className={`d-flex align-items-center text-decoration-none rounded py-2 px-3 ${
                location.pathname === to
                  ? "bg-primary text-white"
                  : "text-dark"
              }`}
              aria-current={location.pathname === to ? "page" : undefined}
            >
              <span className="me-2">{icon}</span>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;