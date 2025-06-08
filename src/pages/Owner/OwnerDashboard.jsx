import React, { useEffect, useState } from "react";
import { getPegawaiByUserId } from "../../api/PegawaiApi";
import { getTopSeller } from "../../api/BadgeApi";
import OwnerSidebar from "../../components/OwnerSideBar";

const AdminDashboard = () => {
  const [namaPegawai, setNamaPegawai] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTopSeller, setCurrentTopSeller] = useState(null);

  useEffect(() => {
    loadCurrentTopSeller();
  }, []);

  const loadCurrentTopSeller = async () => {
    try {
      const response = await getTopSeller();
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
          <>
            <h3>Selamat datang, {namaPegawai}!</h3>
            <div className="mt-4">
              <div className="card mb-4">
                <div className="card-body">
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
                </div>
              </div>
            </div>
          </>
        )}
        <p>Silakan pilih menu di sidebar untuk melanjutkan.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;