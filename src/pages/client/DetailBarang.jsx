import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getBarangById } from "../../api/BarangApi";

const DetailBarang = () => {
  const { id } = useParams();
  const [barang, setBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const result = await getBarangById(id);
        if (result) {
          setBarang(result);
        } else {
          setError("Barang tidak ditemukan");
        }
      } catch (err) {
        setError("Gagal memuat detail barang");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBarang();
  }, [id]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="container my-5 flex-grow-1">
        {loading ? (
          <p>Memuat detail barang...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="row">
            <div className="col-md-5">
              {/* Ganti ini dengan image preview jika ada */}
              <div className="bg-light p-5 text-center">[ Gambar Produk ]</div>
            </div>
            <div className="col-md-7">
              <h2>{barang.nama_barang}</h2>
              <h4 className="text-primary">Rp {barang.harga.toLocaleString()}</h4>
              <p>{barang.deskripsi}</p>
              <p>Berat: {barang.berat} gram</p>
              <p>Masa Garansi: {barang.masa_garansi}</p>

              <button className="btn btn-dark mt-3">Tambah ke Keranjang</button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DetailBarang;