import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBarangById } from "../../api/BarangApi";
import { getFotoBarangByIdBarang } from "../../api/fotoBarangApi";

const DetailBarang = () => {
  const { id } = useParams();
  const [barang, setBarang] = useState(null);
  const [fotoBarang, setFotoBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError("Gagal memuat detail barang");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

              <button className="btn btn-success mt-3">Tambah ke Keranjang</button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DetailBarang;