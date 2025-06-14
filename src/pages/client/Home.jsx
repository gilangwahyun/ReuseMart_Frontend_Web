import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { BsBoxSeam } from "react-icons/bs"; 

import {
  getAllActiveBarang,
  searchBarangByName,
  getBarangByKategori,
} from "../../api/BarangApi";
import { getAllKategori } from "../../api/KategoriBarangApi";

const Home = () => {
  const [barangList, setBarangList] = useState([]);
  const [userName, setUserName] = useState("");
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [kategoriList, setKategoriList] = useState([]);
  const navigate = useNavigate();
  
  // Cek apakah ada parameter kategori di URL
  const { kategori } = useParams();

  // Cek apakah user sudah login dengan melihat token di localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const response = await getAllActiveBarang();

        if (Array.isArray(response.data) && response.data.length === 0) {
          // Data kosong, set state tetap tanpa error
          setBarangList([]);
          setFilteredBarang([]);
          // Optional: bisa set pesan kosong kalau mau tampilkan di UI
        } else {
          setBarangList(response.data);
          setFilteredBarang(response.data);
        }
      } catch (err) {
        alert("Gagal memuat data barang."); // Ini hanya untuk error fetch, bukan data kosong
      } finally {
        setLoading(false);
      }
    };

    fetchBarang();

    // Fetch kategori untuk tombol reset kategori
    getAllKategori().then((data) => setKategoriList(data || []));
    
    // Jika ada parameter kategori di URL, filter barang berdasarkan kategori
    if (kategori) {
      handleKategoriSelect(kategori);
    }
  }, [kategori]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token) {
      setIsLoggedIn(true); // Jika kamu ingin tracking state ini juga
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.nama) {
          setUserName(user.nama);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleSearch = async (searchKeyword) => {
    setSearchLoading(true);
    setSearchError("");
    setSelectedKategori(null); // Reset kategori saat melakukan pencarian

    try {
      // Jika keyword kosong, tampilkan semua barang aktif
      if (!searchKeyword || searchKeyword.trim() === "") {
        const response = await getAllActiveBarang();
        const result = response?.data ?? [];
        setFilteredBarang(Array.isArray(result) ? result : []);
        setSearchLoading(false);
        setSelectedKategori(null); // Reset kategori yang dipilih
        return;
      }

      // Jika ada keyword, lakukan pencarian
      const response = await searchBarangByName(searchKeyword);
      const result = response?.data ?? [];

      if (!Array.isArray(result) || result.length === 0) {
        setSearchError("Barang tidak ditemukan.");
        setFilteredBarang([]);
      } else {
        setFilteredBarang(result);
        setSelectedKategori(null); // Reset kategori yang dipilih
      }
    } catch (err) {
      setSearchError("Terjadi kesalahan saat pencarian.");
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const scrollToProducts = () => {
    const section = document.getElementById("produk-section");
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  const handleKategoriSelect = async (kategori) => {
    setSelectedKategori(kategori);
    setLoading(true);
    setError(null);
    setSearchError(""); // Reset search error
    
    try {
      if (!kategori || kategori === 'Semua') {
        // Reset ke semua barang aktif
        const response = await getAllActiveBarang();
        const result = response?.data ?? [];
        setFilteredBarang(Array.isArray(result) ? result : []);
        setSelectedKategori(null);
      } else {
        const response = await getBarangByKategori(kategori);
        if (response && Array.isArray(response)) {
          setFilteredBarang(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setFilteredBarang(response.data);
        } else {
          setFilteredBarang([]);
          setError("Tidak ada barang dalam kategori ini.");
        }
      }
      // Scroll ke produk
      setTimeout(() => scrollToProducts(), 200);
    } catch (err) {
      console.error("Error saat filter kategori:", err);
      setError("Gagal memuat barang berdasarkan kategori.");
      setFilteredBarang([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUserName("");
      setIsLoggedIn(false);
    };

    window.addEventListener("logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("logout", handleLogoutEvent);
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        onSearch={handleSearch} 
        onKategoriSelect={handleKategoriSelect} 
        activeKategori={selectedKategori}
      />

      {isLoggedIn && userName && (
        <div className="container mt-3">
          <p className="m-0">
            Selamat Datang,{" "}
            <span className="fw-bold fs-5">{userName}</span>!
          </p>
        </div>
      )}
      {/* CTA Banner */}
      <div className="container mt-4">
        <div
          className="bg-success text-white text-center rounded shadow-sm d-flex flex-column justify-content-center align-items-center mx-auto"
          style={{ minHeight: "300px", padding: "2rem" }}
        >
          <h2 className="mb-4">Temukan Barang Bekas Berkualitas!</h2>
          <div>
            <button onClick={scrollToProducts} className="btn btn-light me-3">
              Lihat Produk
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/LoginPage")}
                className="btn btn-outline-light"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </div>

      <main id="produk-section" className="container my-5 flex-grow-1">
        {loading && (
          <div className="d-flex flex-column align-items-center my-5">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Sedang memuat produk, mohon tunggu...</p>
          </div>
        )}

        {error && <p className="text-danger">{error}</p>}

        {selectedKategori && !loading && !error && (
          <div className="d-flex align-items-center mb-3">
            <h5 className="mb-0 me-3">
              Menampilkan produk untuk kategori: <strong>{selectedKategori}</strong>
            </h5>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => handleKategoriSelect('Semua')}
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        {searchError && <p className="text-danger">{searchError}</p>}

        <div className="row g-4">
          {filteredBarang.length > 0 ? (
            filteredBarang.map((product) => (
              <div
                className="col-12 col-sm-6 col-md-4 col-lg-3"
                key={product.id_barang}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center text-muted my-5">
                <BsBoxSeam size={80} className="mb-3" />
                <p>Tidak ada produk ditemukan.</p>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;