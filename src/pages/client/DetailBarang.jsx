import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBarangById } from "../../api/BarangApi";
import { getFotoBarangByIdBarang } from "../../api/fotoBarangApi";
import { getDiskusiByBarang } from "../../api/DiskusiApi"; // Import the new API function
import { createDiskusi } from "../../api/DiskusiApi"; // Import the new API function
import { getKeranjangByPembeli, getKeranjangById, getKeranjangByIdUser } from "../../api/KeranjangApi";
import { createDetailKeranjang } from "../../api/DetailKeranjangApi";
import { getByIdBarang } from "../../api/PenitipanBarangApi";
import { getRated } from "../../api/PenitipApi";
import { getTopSeller } from "../../api/BadgeApi";
import { toast } from "react-toastify";
import { FaStar, FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const DetailBarang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barang, setBarang] = useState(null);
  const [fotoBarang, setFotoBarang] = useState([]);
  const [diskusi, setDiskusi] = useState([]); // State for diskusi
  const [penitipan, setPenitipan] = useState(null);
  const [rataRataRating, setRataRataRating] = useState(null);
  const [jumlahRating, setJumlahRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDiskusi, setNewDiskusi] = useState(""); // Add state for new comment
  const [submitting, setSubmitting] = useState(false); // Add state for submission status
  const [addingToCart, setAddingToCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const [topSellerBadge, setTopSellerBadge] = useState(null);

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

        // Fetch penitipan by id barang
        const penitipanResult = await getByIdBarang(id);
        console.log('penitipanResult:', penitipanResult);

        if (penitipanResult && penitipanResult.penitip) {
          setPenitipan(penitipanResult);

          // Ambil langsung dari hasil respons, bukan dari state
          const ratingResult = await getRated(penitipanResult.penitip.id_penitip);
          console.log('ratingResult:', ratingResult);
          setRataRataRating(ratingResult.rata_rata_rating);
          setJumlahRating(ratingResult.jumlah_barang_terjual_dan_terrating);

          // Cek apakah penitip adalah TOP SELLER
          const topSellerResult = await getTopSeller();
          if (topSellerResult.data && topSellerResult.data.id_penitip === penitipanResult.penitip.id_penitip) {
            setTopSellerBadge(topSellerResult.data);
          }
        } else {
          setPenitipan(null);
        }
      } catch (err) {
        setError("Gagal memuat detail barang");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (fotoBarang.length > 1 && carouselRef.current) {
      // Inisialisasi Bootstrap Carousel secara manual
      let carouselInstance = null;
      import('bootstrap/dist/js/bootstrap.bundle.min.js').then(({ Carousel }) => {
        carouselInstance = Carousel.getOrCreateInstance(carouselRef.current);
      });
      const carouselEl = carouselRef.current;
      const handler = (e) => {
        // e.to untuk Bootstrap 5, e.detail.to untuk beberapa implementasi
        if (typeof e.to !== 'undefined') {
          setActiveIndex(e.to);
        } else if (e.detail && typeof e.detail.to !== 'undefined') {
          setActiveIndex(e.detail.to);
        } else {
          // Fallback: cari .carousel-item.active
          const items = carouselEl.querySelectorAll('.carousel-item');
          items.forEach((item, idx) => {
            if (item.classList.contains('active')) setActiveIndex(idx);
          });
        }
      };
      carouselEl.addEventListener('slid.bs.carousel', handler);
      return () => {
        carouselEl.removeEventListener('slid.bs.carousel', handler);
        if (carouselInstance) {
          carouselInstance.dispose && carouselInstance.dispose();
        }
      };
    }
  }, [fotoBarang]);

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
          toast.warning("Barang sudah ada di keranjang");
        } else {
          toast.success("Barang berhasil ditambahkan ke keranjang");
        }
      } catch (err) {
        console.error("Error getting keranjang:", err);
        if (err.response?.status === 404) {
          toast.error("Keranjang tidak ditemukan");
        } else {
          toast.error(err.response?.data?.message || "Gagal mengakses keranjang");
        }
        return;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.response?.data?.message || "Gagal menambahkan ke keranjang");
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
          <>
            {/* Tombol Back */}
            <div className="mb-3">
              <button
                className="btn btn-sm btn-outline-success px-2 py-1 fw-normal"
                style={{ fontSize: '0.98rem' }}
                onClick={() => navigate(-1)}
              >
                <span aria-hidden="true">&#8592;</span> Kembali
              </button>
            </div>
            <div className="row g-4">
              {/* FOTO PRODUK */}
              <div className="col-md-5">
                <div className="card shadow-sm p-3 bg-white border-0">
                  <div
                    id="carouselExampleControls"
                    className="carousel slide position-relative"
                    data-bs-ride="carousel"
                    data-bs-wrap="false"
                    ref={carouselRef}
                  >
                    {/* Carousel Indicators */}
                    {fotoBarang.length > 1 && (
                      <div className="w-100 d-flex justify-content-center position-absolute" style={{ left: 0, bottom: 12, zIndex: 2 }}>
                        {fotoBarang.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            data-bs-target="#carouselExampleControls"
                            data-bs-slide-to={idx}
                            className={activeIndex === idx ? "active" : ""}
                            aria-current={activeIndex === idx ? "true" : undefined}
                            aria-label={`Slide ${idx + 1}`}
                            style={{ width: 10, height: 10, borderRadius: '50%', margin: '0 4px', background: '#198754', opacity: activeIndex === idx ? 1 : 0.4, border: 'none', transition: 'opacity 0.2s' }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="carousel-inner">
                      {fotoBarang.length > 0 ? (
                        fotoBarang.map((foto, index) => (
                          <div
                            className={`carousel-item ${index === 0 ? "active" : ""}`}
                            key={foto.id_foto_barang}
                          >
                            <img
                              src={`http://127.0.0.1:8000/${foto.url_foto}`}
                              className="d-block w-100 rounded"
                              alt={`Foto ${barang.nama_barang} ${index + 1}`}
                              style={{ height: "400px", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="carousel-item active">
                          <img
                            src="/assets/logoReuseMart.png"
                            className="d-block w-100 rounded"
                            alt="Foto tidak tersedia"
                            style={{ height: "400px", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
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
              </div>

              {/* DETAIL BARANG */}
              <div className="col-md-7">
                <div className="card shadow-sm p-4 h-100 d-flex flex-column justify-content-between border-0">
                  <div>
                    <h2 className="mb-2" style={{ fontWeight: 600 }}>{barang.nama_barang}</h2>
                    <h4 className="text-success mb-3" style={{ fontWeight: 700 }}>Rp{barang.harga.toLocaleString()}</h4>
                    <ul className="list-unstyled mb-3" style={{ fontSize: '1rem' }}>
                      <li><strong>Berat:</strong> {barang.berat} gram</li>
                      <li><strong>Garansi (Sampai):</strong> {barang.masa_garansi ? new Date(barang.masa_garansi).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "Tidak ada garansi"}</li>
                    </ul>
                    <p className="mb-3" style={{ fontSize: '1.05rem' }}>{barang.deskripsi}</p>
                    <div className="d-flex align-items-center mb-2" style={{ fontSize: '0.98rem' }}>
                      <strong>{penitipan?.penitip.nama_penitip}</strong>
                      {topSellerBadge && (
                        <div className="badge bg-warning text-white ms-2 d-flex align-items-center" 
                             style={{ fontSize: '0.8rem', padding: '0.35em 0.65em' }}>
                          <FaStar className="me-1" style={{ fontSize: '0.9rem' }} />
                          {topSellerBadge.nama_badge}
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${topSellerBadge.id_badge}`}>
                                Penitip dengan performa penjualan terbaik bulan lalu
                              </Tooltip>
                            }
                          >
                            <div className="ms-1 d-flex align-items-center" style={{ cursor: 'help' }}>
                              <FaInfoCircle style={{ fontSize: '0.9rem' }} />
                            </div>
                          </OverlayTrigger>
                        </div>
                      )}
                      {rataRataRating !== undefined && rataRataRating !== null && (
                        <span className="ms-2 d-inline-flex align-items-center" style={{ color: '#222', fontWeight: 500 }}>
                          <FaStar className="me-1" style={{ color: 'transparent', stroke: '#222', strokeWidth: 40, fontSize: '1.1rem' }} />
                          {rataRataRating.toFixed(1)}
                          <span className="text-muted ms-1" style={{ fontSize: '0.97rem' }}>
                            {jumlahRating !== undefined && jumlahRating !== null ? `(${jumlahRating})` : ''}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn btn-success btn-lg w-100 mt-4" 
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
                </div>
              </div>

              {/* DISKUSI */}
              <div className="col-12">
                <div className="card shadow-sm p-4 mt-4 border-0" style={{ borderTop: '1px solid #eee' }}>
                  <h5 className="mb-4" style={{ fontWeight: 600 }}>Diskusi</h5>
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
                    <ul className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.97rem' }}>
                      {diskusi.map((item) => (
                        <li key={item.id_diskusi} className="list-group-item py-2 px-1">
                          <p className="mb-1">{item.komen}</p>
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DetailBarang;
