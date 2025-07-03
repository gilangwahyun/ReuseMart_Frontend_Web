import React, { useEffect, useState } from "react";

import { getPegawaiByUserId } from "../../api/PegawaiApi";
import { getCurrentTopSeller } from "../../api/BadgeApi";

import OwnerSidebar from "../../components/OwnerSideBar";
import { Card } from "react-bootstrap";

const OwnerDashboard = () => {
  const [namaPegawai, setNamaPegawai] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTopSeller, setCurrentTopSeller] = useState(null);

  useEffect(() => {
    loadCurrentTopSeller();
  }, []);

  const loadCurrentTopSeller = async () => {
    try {
      const response = await getCurrentTopSeller();
      if (response.data) {
        setCurrentTopSeller(response.data);
      }
    } catch (error) {
      console.error("Error loading current top seller:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      setError("Pengguna belum login.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      const idUser = user.id_user;

      const fetchPegawai = async () => {
        try {
          const response = await getPegawaiByUserId(idUser);
          const data = response;
          console.log(response);

          if (data && data.nama_pegawai) {
            setNamaPegawai(data.nama_pegawai);
          } else {
            setError("Data pegawai tidak ditemukan.");
          }
        } catch (err) {
          console.error(err);
          setError("Gagal mengambil data pegawai.");
        } finally {
          setLoading(false);
        }
      };

      fetchPegawai();
    } catch (err) {
      console.error("Error parsing user data:", err);
      setError("Data pengguna tidak valid.");
      setLoading(false);
    }
  }, []);

  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        {loading ? (
          <p>Memuat data pegawai...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div>
            <h3>Selamat datang, {namaPegawai}!</h3>
            <p>Silakan pilih menu di sidebar untuk melanjutkan.</p>
            
            <div className="mt-4">
              <Card className="mb-4">
                <Card.Body>
                  <h5 className="card-title">TOP SELLER Saat Ini</h5>
                  {currentTopSeller ? (
                    <div className="mt-3">
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-warning me-2">
                          <i className="fas fa-star me-1"></i>
                          TOP SELLER
                        </div>
                        <h6 className="mb-0">{currentTopSeller.penitip?.nama_penitip}</h6>
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                        {currentTopSeller.deskripsi}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">Belum ada TOP SELLER yang aktif</p>
                  )}
                </Card.Body>
              </Card>
            </div>

            <div className="mt-4">
              <Card>
                <Card.Body>
                  <h5 className="card-title">Informasi Menu Laporan</h5>
                  <p>Silakan gunakan menu di sidebar untuk mengakses berbagai laporan:</p>
                  <ul className="mb-0">
                    <li>Laporan Penjualan - Menampilkan laporan penjualan bulanan keseluruhan</li>
                    <li>Laporan Kategori - Menampilkan laporan penjualan per kategori barang</li>
                    <li>Laporan Penitipan Habis - Menampilkan laporan barang yang habis masa penitipan</li>
                    <li>Laporan Stok Gudang - Menampilkan laporan stok barang di gudang</li>
                    <li>Laporan Komisi - Menampilkan laporan komisi penitip, pegawai, dan perusahaan</li>
                  </ul>
                </Card.Body>
              </Card>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;