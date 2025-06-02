import React, { useEffect, useState } from "react";
import Owner from "../../components/OwnerSideBar";
import { getPegawaiByUserId } from "../../api/PegawaiApi";
import OwnerSidebar from "../../components/OwnerSideBar";

const AdminDashboard = () => {
  const [namaPegawai, setNamaPegawai] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <h3>Selamat datang, {namaPegawai}!</h3>
        )}
        <p>Silakan pilih menu di sidebar untuk melanjutkan.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;