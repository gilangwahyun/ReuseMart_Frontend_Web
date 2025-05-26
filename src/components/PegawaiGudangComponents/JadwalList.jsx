import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import useAxios from "../../api";
import { useNavigate } from "react-router-dom";

const JadwalList = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await useAxios.get("/jadwal");
      setJadwal(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      setError("Gagal memuat data jadwal. Silakan coba lagi nanti.");
      setLoading(false);
    }
  };

  const updateStatusJadwal = async (id, newStatus) => {
    try {
      // First, fetch the current jadwal data
      const currentJadwal = await useAxios.get(`/jadwal/${id}`);
      
      // Keep the original id_pegawai value (which could be null)
      // Do not modify it or set it to 0
      
      // Update only the status while keeping other required fields
      await useAxios.put(`/jadwal/${id}`, {
        id_transaksi: currentJadwal.data.id_transaksi,
        id_pegawai: currentJadwal.data.id_pegawai, // Keep original value
        tanggal: currentJadwal.data.tanggal,
        status_jadwal: newStatus
      });
      
      fetchJadwal(); // Refresh data after update
    } catch (error) {
      console.error("Error updating status jadwal:", error);
      setError("Gagal mengubah status jadwal. Silakan coba lagi nanti.");
    }
  };

  const handleCetakNota = (jadwalId) => {
    navigate(`/pegawaiGudang/nota-pengiriman/${jadwalId}`);
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Tidak Ada</Badge>;

    switch (status) {
      case "Menunggu Diambil":
        return <Badge bg="warning">Menunggu Diambil</Badge>;
      case "Sedang Dikirim":
        return <Badge bg="info">Sedang Dikirim</Badge>;
      case "Sudah Diambil":
        return <Badge bg="success">Sudah Diambil</Badge>;
      case "Sudah Sampai":
        return <Badge bg="success">Sudah Sampai</Badge>;
      case "Dibatalkan":
        return <Badge bg="danger">Dibatalkan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Check if it's a courier delivery (has a pegawai assigned)
  const isCourierDelivery = (item) => {
    return item && item.pegawai && item.id_pegawai;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data jadwal...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Daftar Penjadwalan Pengiriman</h2>
        <Button 
          variant="success" 
          onClick={() => fetchJadwal()}
        >
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Table striped bordered hover responsive>
        <thead className="bg-light">
          <tr>
            <th>ID Jadwal</th>
            <th>ID Transaksi</th>
            <th>Kurir</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {jadwal.length > 0 ? (
            jadwal.map((item) => (
              <tr key={item.id_jadwal}>
                <td>{item.id_jadwal}</td>
                <td>{item.id_transaksi}</td>
                <td>
                  {item.pegawai ? (
                    <>
                      <div>{item.pegawai.nama_pegawai}</div>
                      <small className="text-muted">{item.pegawai.no_telepon}</small>
                    </>
                  ) : (
                    "Diambil Mandiri"
                  )}
                </td>
                <td>{formatDate(item.tanggal)}</td>
                <td>{getStatusBadge(item.status_jadwal)}</td>
                <td>
                  {/* Status update buttons */}
                  {item.status_jadwal === "Sedang Dikirim" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Sudah Sampai")}
                    >
                      Tandai Sudah Sampai
                    </Button>
                  )}
                  {item.status_jadwal === "Menunggu Diambil" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Sudah Diambil")}
                    >
                      Tandai Sudah Diambil
                    </Button>
                  )}
                  
                  {/* Print receipt button - only for courier deliveries */}
                  {isCourierDelivery(item) && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleCetakNota(item.id_jadwal)}
                      title="Cetak nota pengiriman"
                    >
                      <i className="bi bi-printer"></i> Cetak Nota
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                Tidak ada jadwal pengiriman ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default JadwalList; 