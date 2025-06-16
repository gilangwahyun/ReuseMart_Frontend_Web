import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUser, FaInfoCircle, FaEnvelope, FaPhone, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaSearch, FaTimes, FaList } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "/assets/logoReuseMart.png";
import { getAllKategori } from "../api/KategoriBarangApi";
import { searchBarangByName } from "../api/BarangApi";

const Navbar = ({ onKategoriSelect = () => {}, onSearch = () => {}, activeKategori = null }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
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
      const profileMenu = document.getElementById("profileMenu");
      const profileToggle = document.getElementById("profileToggle");

      if (panel && !panel.contains(e.target) && !toggle.contains(e.target)) {
        setShowPanel(false);
      }

      if (profileMenu && !profileMenu.contains(e.target) && !profileToggle.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataStr = localStorage.getItem("user");
    setIsLoggedIn(!!token);

    if (userDataStr) {
      try {
        const user = JSON.parse(userDataStr);
        setUserId(user.id_user);
        setUserData(user);
        console.log("Data user dari localStorage:", user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const togglePanel = () => setShowPanel((prev) => !prev);
  const toggleProfileMenu = () => setShowProfileMenu((prev) => !prev);

  const handleKategoriClick = (namaKategori) => {
    setShowPanel(false);
    onKategoriSelect(namaKategori);
    setSearchKeyword(""); // Reset pencarian saat memilih kategori
  };

  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    onSearch(searchKeyword);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const clearSearch = () => {
    setSearchKeyword("");
    onSearch("");
  };

  const handleProfileClick = () => {
    if (isLoggedIn && userId) {
      if (userData && userData.role === "Pembeli") {
        navigate(`/DashboardProfilPembeli/${userId}`);
      } else if (userData && userData.role === "Penitip") {
        navigate(`/DashboardPenitip`);
      }
    } else {
      navigate("/LoginPage");
    }
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    setShowProfileMenu(false);
    window.dispatchEvent(new Event("logout"));
    navigate("/");
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/LoginPage");
      return;
    }
    if (userId) {
      navigate(`/keranjang/${userId}`);
    }
  };

  const getUserDisplayName = (user) => {
    if (!user) return '';
    
    if (user.role === "Pembeli") {
      if (user.pembeli?.nama_pembeli) return user.pembeli.nama_pembeli;
      if (user.nama_pembeli) return user.nama_pembeli;
    }
    
    if (user.role === "Penitip") {
      if (user.penitip?.nama_penitip) return user.penitip.nama_penitip;
      if (user.nama_penitip) return user.nama_penitip;
    }
    
    if (user.nama) return user.nama;
    if (user.name) return user.name;
    
    return '';
  };

  const showUserMenu = () => {
    if (!isLoggedIn) {
      return (
        <div
          id="profileMenu"
          className="position-absolute end-0 mt-2 bg-white shadow rounded-3 border"
          style={{ zIndex: 1000, minWidth: "220px" }}
        >
          <div className="p-3 border-bottom">
            <div className="fw-bold text-dark">Selamat Datang</div>
            <div className="small text-muted">Silakan masuk untuk melanjutkan</div>
          </div>
          <Link
            to="/LoginPage"
            className="dropdown-item py-2 px-3 d-flex align-items-center text-decoration-none"
            onClick={() => setShowProfileMenu(false)}
          >
            <FaSignInAlt className="me-2 text-success" size={14} />
            <span className="text-dark">Masuk</span>
          </Link>
          <Link
            to="/RegisterPembeli"
            className="dropdown-item py-2 px-3 d-flex align-items-center text-decoration-none"
            onClick={() => setShowProfileMenu(false)}
          >
            <FaUserPlus className="me-2 text-success" size={14} />
            <span className="text-dark">Daftar</span>
          </Link>
        </div>
      );
    }

    return (
      <div
        id="profileMenu"
        className="position-absolute end-0 mt-2 bg-white shadow rounded-3 border"
        style={{ zIndex: 1000, minWidth: "220px" }}
      >
        <div className="p-3 border-bottom">
          <div className="fw-bold text-dark">
            {getUserDisplayName(userData)}
          </div>
          <div className="small text-muted">{userData?.email}</div>
          <div className="small text-success">{userData?.role}</div>
        </div>
        <button
          className="dropdown-item py-2 px-3 d-flex align-items-center w-100 text-start border-0 bg-transparent"
          onClick={handleProfileClick}
        >
          <FaUser className="me-2 text-success" size={14} />
          <span className="text-dark">Profil Saya</span>
        </button>
        {userData?.role === "Penitip" && (
          <button
            className="dropdown-item py-2 px-3 d-flex align-items-center w-100 text-start border-0 bg-transparent"
            onClick={() => {
              navigate("/DashboardBarangPenitip");
              setShowProfileMenu(false);
            }}
          >
            <FaList className="me-2 text-success" size={14} />
            <span className="text-dark">Dashboard Barang</span>
          </button>
        )}
        <button
          className="dropdown-item py-2 px-3 d-flex align-items-center w-100 text-start border-0 bg-transparent"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2 text-danger" size={14} />
          <span className="text-danger">Keluar</span>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Top Bar untuk Informasi Umum */}
      <div className="bg-success bg-opacity-10 py-2 border-bottom">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <a href="mailto:info@reusemart.com" className="text-muted small text-decoration-none d-flex align-items-center">
              <FaEnvelope className="me-1" size={12} />
              <span>info@reusemart.com</span>
            </a>
            <a href="tel:+6281234567890" className="text-muted small text-decoration-none d-flex align-items-center">
              <FaPhone className="me-1" size={12} />
              <span>+62 812 3456 7890</span>
            </a>
          </div>
          <Link to="/informasi" className="text-success small text-decoration-none d-flex align-items-center">
            <FaInfoCircle className="me-1" size={14} />
            <span>Informasi Umum</span>
          </Link>
        </div>
      </div>
      
      {/* Navbar Utama */}
      <nav
        className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top"
        style={{ backgroundColor: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="container position-relative">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo} alt="Logo" height="40" className="me-2" />
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center w-100">
              <li className="nav-item me-3">
                <button
                  className="btn nav-link d-flex align-items-center"
                  id="kategoriToggle"
                  onClick={togglePanel}
                  style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer" }}
                >
                  <FaList className="me-1" size={14} />
                  <span className="text-dark">
                    {activeKategori ? `Kategori: ${activeKategori}` : "Kategori"}
                  </span>
                </button>
              </li>

              <div className="position-relative me-auto" style={{ maxWidth: "400px", width: "50%" }}>
                <div className="input-group">
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Cari produk..."
                    aria-label="Search"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                  />
                  {searchKeyword && (
                    <button 
                      className="btn btn-outline-secondary border-0" 
                      type="button"
                      onClick={clearSearch}
                      title="Hapus pencarian"
                    >
                      <FaTimes size={14} />
                    </button>
                  )}
                  <button 
                    className="btn btn-success" 
                    type="button" 
                    onClick={handleSearchClick}
                    title="Cari"
                  >
                    <FaSearch size={14} />
                  </button>
                </div>
              </div>

              <li className="nav-item me-3">
                <button
                  className="btn nav-link text-dark"
                  onClick={handleCartClick}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <FaShoppingCart size={18} />
                </button>
              </li>

              <li className="nav-item position-relative">
                <button
                  id="profileToggle"
                  className="btn nav-link d-flex align-items-center"
                  onClick={toggleProfileMenu}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <div className="position-relative">
                    <FaUser size={18} className="text-dark" />
                  </div>
                  {isLoggedIn && userData && (
                    <span className="ms-2 d-none d-md-inline text-dark">
                      {getUserDisplayName(userData)}
                    </span>
                  )}
                </button>

                {showProfileMenu && showUserMenu()}
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
                  <>
                    <div className="col-6 col-md-3 mb-2">
                      <button
                        onClick={() => handleKategoriClick('Semua')}
                        className={`btn btn-link text-start w-100 text-decoration-none fw-bold ${
                          activeKategori === 'Semua' || !activeKategori ? 'text-success' : 'text-dark'
                        }`}
                        style={{ padding: "8px 15px" }}
                      >
                        Semua Kategori
                      </button>
                    </div>
                    {kategoriList.map((kategori) => (
                      <div className="col-6 col-md-3 mb-2" key={kategori.id_kategori}>
                        <button
                          onClick={() => handleKategoriClick(kategori.nama_kategori)}
                          className={`btn btn-link text-start w-100 text-decoration-none ${
                            activeKategori === kategori.nama_kategori ? 'text-success fw-bold' : 'text-dark'
                          }`}
                          style={{ padding: "8px 15px" }}
                        >
                          {kategori.nama_kategori}
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;