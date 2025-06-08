import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getPegawaiByUserId } from "../../api/PegawaiApi";
import { setTopSeller, getTopSeller } from "../../api/BadgeApi";
import { Toast, ToastContainer } from "react-bootstrap";

const AdminDashboard = () => {
  const [namaPegawai, setNamaPegawai] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rekapMessage, setRekapMessage] = useState(null);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
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

  const handleRekapTopSeller = async () => {
    try {
      setRekapLoading(true);
      const response = await setTopSeller();
      
      if (response.data) {
        setRekapMessage({
          type: "success",
          title: "Rekap TOP SELLER Berhasil! 🏆",
          text: `Berhasil mengupdate TOP SELLER untuk periode ${response.data.periode}`,
          details: {
            namaPenitip: response.data.nama_penitip,
            totalTransaksi: response.data.total_transaksi,
            totalPenjualan: new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(response.data.total_penjualan),
            bonus: new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(response.data.bonus),
            saldoTerbaru: new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(response.data.saldo_terbaru)
          }
        });

        // Reload current top seller data
        loadCurrentTopSeller();
      } else {
        setRekapMessage({
          type: "info",
          title: "Tidak Ada TOP SELLER 📊",
          text: response.message
        });
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setTimeout(() => setRekapMessage(null), 500);
      }, 10000);
    } catch (error) {
      const errorData = error.response?.data;
      
      let errorTitle = "Gagal Melakukan Rekap ❌";
      let errorText = "Terjadi kesalahan saat melakukan rekap TOP SELLER.";
      let errorDetails = null;

      if (errorData) {
        // Jika rekap sudah dilakukan
        if (errorData.next_available_periode) {
          errorTitle = "Rekap Sudah Dilakukan ⚠️";
          errorText = errorData.message;
          errorDetails = {
            nextPeriode: `Rekap berikutnya tersedia untuk periode: ${errorData.next_available_periode}`,
            nextDate: errorData.next_rekap_date ? 
              `Tanggal rekap berikutnya: ${errorData.next_rekap_date}` : null
          };
        } 
        // Jika badge belum dikonfigurasi
        else if (errorData.message.includes("belum dikonfigurasi")) {
          errorTitle = "Konfigurasi Tidak Ditemukan ⚙️";
          errorText = errorData.message;
          errorDetails = {
            detail: errorData.detail
          };
        }
        // Error lainnya
        else {
          errorText = errorData.message;
          if (errorData.detail) {
            errorDetails = {
              detail: errorData.detail
            };
          }
        }
      }

      setRekapMessage({
        type: "error",
        title: errorTitle,
        text: errorText,
        details: errorDetails
      });
      setShowToast(true);
    } finally {
      setRekapLoading(false);
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

  const getToastBg = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "info":
        return "info";
      default:
        return "light";
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
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

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Manajemen TOP SELLER</h5>
                  <p className="card-text">
                    Klik tombol di bawah untuk melakukan rekap dan menentukan TOP SELLER bulan lalu.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={handleRekapTopSeller}
                    disabled={rekapLoading}
                  >
                    {rekapLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sedang Merekap...
                      </>
                    ) : (
                      "Rekap TOP SELLER"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Toast Container */}
            <ToastContainer className="p-3" position="bottom-end">
              <Toast 
                show={showToast} 
                onClose={() => setShowToast(false)}
                bg={getToastBg(rekapMessage?.type)}
                className="toast-width"
              >
                <Toast.Header closeButton={true}>
                  <strong className="me-auto">{rekapMessage?.title}</strong>
                </Toast.Header>
                <Toast.Body className={rekapMessage?.type === "error" ? "text-white" : ""}>
                  <p className="mb-0">{rekapMessage?.text}</p>
                  
                  {rekapMessage?.details && (
                    <div className="mt-3 pt-3 border-top border-opacity-25">
                      {rekapMessage.type === "success" ? (
                        <>
                          <p className="mb-1"><strong>Nama Penitip:</strong> {rekapMessage.details.namaPenitip}</p>
                          <p className="mb-1"><strong>Total Transaksi:</strong> {rekapMessage.details.totalTransaksi}</p>
                          <p className="mb-1"><strong>Total Penjualan:</strong> {rekapMessage.details.totalPenjualan}</p>
                          <p className="mb-1"><strong>Bonus (1%):</strong> {rekapMessage.details.bonus}</p>
                          <p className="mb-0"><strong>Saldo Terbaru:</strong> {rekapMessage.details.saldoTerbaru}</p>
                        </>
                      ) : (
                        <>
                          {rekapMessage.details.detail && (
                            <p className="mb-1">{rekapMessage.details.detail}</p>
                          )}
                          {rekapMessage.details.nextPeriode && (
                            <p className="mb-1">{rekapMessage.details.nextPeriode}</p>
                          )}
                          {rekapMessage.details.nextDate && (
                            <p className="mb-0">{rekapMessage.details.nextDate}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Toast.Body>
              </Toast>
            </ToastContainer>
          </>
        )}
        <p>Silakan pilih menu di sidebar untuk melanjutkan.</p>
      </div>

      <style jsx>{`
        .toast-width {
          min-width: 350px;
        }
        .toast-width .toast-body {
          white-space: pre-line;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;