import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBarangById } from "../../api/BarangApi";
import { getFotoBarangByIdBarang } from "../../api/fotoBarangApi";
import { getDiskusiByBarang } from "../../api/DiskusiApi"; // Import the new API function
import { createDiskusi } from "../../api/DiskusiApi"; // Import the new API function
import { getKeranjangByPembeli, getKeranjangById, getKeranjangByIdUser } from "../../api/KeranjangApi";
import { createDetailKeranjang } from "../../api/DetailKeranjangApi";
import { toast } from "react-toastify";

const DetailBarang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barang, setBarang] = useState(null);
  const [fotoBarang, setFotoBarang] = useState([]);
  const [diskusi, setDiskusi] = useState([]); // State for diskusi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDiskusi, setNewDiskusi] = useState(""); // Add state for new comment
  const [submitting, setSubmitting] = useState(false); // Add state for submission status
  const [addingToCart, setAddingToCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getBarangById(id);
        if (result) {
          setBarang(result);
        } else {
          setError("Barang tidak ditemukan");
        }

        const fotoResult = await getFotoBarangByIdBarang(id);
        if (fotoResult) {
          setFotoBarang(fotoResult);
        }

        // Fetch diskusi related to the barang
        const diskusiResult = await getDiskusiByBarang(id);
        setDiskusi(diskusiResult);
      } catch (err) {
        setError("Gagal memuat detail barang");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitDiskusi = async (e) => {
    e.preventDefault();
    if (!newDiskusi.trim()) return;

    setSubmitting(true);
    try {
      const diskusiData = {
        id_barang: id,
        komen: newDiskusi.trim(),
      };
      
      const result = await createDiskusi(diskusiData);
      setDiskusi([...diskusi, result]); // Add new comment to existing list
      setNewDiskusi(""); // Clear the input
    } catch (err) {
      setError("Gagal menambahkan diskusi");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!isLoggedIn) {
        navigate("/LoginPage");
        return;
      }

      setAddingToCart(true);

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        toast.error("Silakan login kembali");
        navigate("/LoginPage");
        return;
      }

      // Get keranjang using id_user
      try {
        const keranjang = await getKeranjangByIdUser(userData.id_user);
        console.log("Keranjang response:", keranjang); // Debug log

        // Add item to cart
        const detailKeranjangData = {
          id_keranjang: keranjang.id_keranjang,
          id_barang: barang.id_barang
        };

        const result = await createDetailKeranjang(detailKeranjangData);
        
        if (result.message === "Barang sudah ada di keranjang") {
          alert("Barang sudah ada di keranjang");
        } else {
          alert("Barang berhasil ditambahkan ke keranjang!");
        }
      } catch (err) {
        console.error("Error getting keranjang:", err);
        if (err.response?.status === 404) {
          alert("Keranjang tidak ditemukan");
        } else {
          alert(err.response?.data?.message || "Gagal mengakses keranjang");
        }
        return;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.message || "Gagal menambahkan ke keranjang");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="container my-5 flex-grow-1">
        {loading ? (
          <div className="d-flex flex-column align-items-center my-5">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Sedang memuat detail barang, mohon tunggu...</p>
          </div>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="row">
            <div className="col-md-5">
              <div
                id="carouselExampleControls"
                className="carousel slide"
                data-bs-ride="carousel"
                data-bs-wrap="false"
              >
                <div className="carousel-inner">
                  {fotoBarang.length > 0 ? (
                    fotoBarang.map((foto, index) => (
                      <div
                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                        key={foto.id_foto_barang}
                      >
                        <img
                          src={`http://127.0.0.1:8000/${foto.url_foto}`}
                          className="d-block w-100"
                          alt={`Foto ${barang.nama_barang} ${index + 1}`}
                          style={{ height: "400px", objectFit: "cover" }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="carousel-item active">
                      <img
                        src="/assets/logoReuseMart.png"
                        className="d-block w-100"
                        alt="Foto tidak tersedia"
                        style={{ height: "400px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
                {fotoBarang.length > 1 && (
                  <>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#carouselExampleControls"
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#carouselExampleControls"
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DETAIL BARANG */}
            <div className="col-md-7">
              <h2>{barang.nama_barang}</h2>
              <h4 className="text-secondary">Rp{barang.harga.toLocaleString()}</h4>
              <p>{barang.deskripsi}</p>
              <p>Berat: {barang.berat} gram</p>
              <p>Masa Garansi: {barang.masa_garansi || "Tidak ada garansi"}</p>

              <button 
                className="btn btn-success mt-3" 
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Menambahkan...
                  </>
                ) : (
                  'Tambah ke Keranjang'
                )}
              </button>

              {/* DISKUSI SECTION */}
              <div className="mt-5">
                <h3>Diskusi</h3>
                
                {/* Add Diskusi Form */}
                <form onSubmit={handleSubmitDiskusi} className="mb-4">
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Tulis diskusi Anda di sini..."
                      value={newDiskusi}
                      onChange={(e) => setNewDiskusi(e.target.value)}
                      disabled={submitting}
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={submitting || !newDiskusi.trim()}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Diskusi'
                    )}
                  </button>
                </form>

                {diskusi.length > 0 ? (
                  <ul className="list-group">
                    {diskusi.map((item) => (
                      <li key={item.id_diskusi} className="list-group-item">
                        <p className="mb-0">{item.komen}</p>
                        <small className="text-muted">
                          {new Date(item.created_at).toLocaleString('id-ID')}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Belum ada diskusi untuk barang ini.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DetailBarang;
