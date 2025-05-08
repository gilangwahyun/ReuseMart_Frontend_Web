import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "/assets/logoReuseMart.png";
import { getAllKategori } from "../api/KategoriBarangApi";

const Navbar = ({ onKategoriSelect = () => {} }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const data = await getAllKategori();
        setKategoriList(data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKategori();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const panel = document.getElementById("kategoriPanel");
      const toggle = document.getElementById("kategoriToggle");
      if (panel && !panel.contains(e.target) && !toggle.contains(e.target)) {
        setShowPanel(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const togglePanel = () => {
    setShowPanel((prev) => !prev);
  };

  const handleKategoriClick = (namaKategori) => {
    setShowPanel(false);
    onKategoriSelect(namaKategori); // Kirim event ke parent (jika ada)
    navigate(`/?kategori=${namaKategori}`);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top"
      style={{ backgroundColor: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="container position-relative">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" height="40" className="me-2" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center w-100">
            <li className="nav-item me-3">
              <button
                className="btn nav-link text-dark"
                id="kategoriToggle"
                onClick={togglePanel}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Kategori
              </button>
            </li>

            <form className="d-flex me-auto w-50" style={{ maxWidth: "400px" }}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Cari produk..."
                aria-label="Search"
              />
              <button className="btn btn-outline-dark" type="submit">
                Cari
              </button>
            </form>

            <li className="nav-item me-3">
              <Link className="nav-link text-dark" to="/cart">
                <FaShoppingCart size={18} />
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/profile">
                <FaUser size={18} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Panel kategori */}
        <div
          id="kategoriPanel"
          className="position-absolute top-100 start-0 w-100 bg-white shadow-sm border-top"
          style={{
            zIndex: 1000,
            display: showPanel ? "block" : "none",
            padding: "1rem",
          }}
        >
          <div className="container py-3">
            <div className="row">
              {loading ? (
                <p>Memuat kategori...</p>
              ) : (
                kategoriList.map((kategori) => (
                  <div className="col-6 col-md-3" key={kategori.id_kategori}>
                    <button
                      onClick={() => handleKategoriClick(kategori.nama_kategori)}
                      className="btn btn-link text-start w-100 text-decoration-none text-dark"
                      style={{ padding: "8px 15px", color: "#333" }}
                    >
                      {kategori.nama_kategori}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;