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
      await useAxios.put(`/jadwal/${id}`, { status_jadwal: newStatus });
      fetchJadwal(); // Refresh data after update
    } catch (error) {
      console.error("Error updating status jadwal:", error);
      setError("Gagal mengubah status jadwal. Silakan coba lagi nanti.");
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Tidak Ada</Badge>;

    switch (status) {
      case "Menunggu":
        return <Badge bg="warning">Menunggu</Badge>;
      case "Sedang Dikirim":
        return <Badge bg="info">Sedang Dikirim</Badge>;
      case "Selesai":
        return <Badge bg="success">Selesai</Badge>;
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
                    "Belum ditentukan"
                  )}
                </td>
                <td>{formatDate(item.tanggal)}</td>
                <td>{getStatusBadge(item.status_jadwal)}</td>
                <td>
                  {item.status_jadwal === "Menunggu" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Sedang Dikirim")}
                    >
                      Mulai Pengiriman
                    </Button>
                  )}
                  {item.status_jadwal === "Sedang Dikirim" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Selesai")}
                    >
                      Selesai
                    </Button>
                  )}
                  {(item.status_jadwal === "Menunggu" || item.status_jadwal === "Sedang Dikirim") && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Dibatalkan")}
                    >
                      Batalkan
                    </Button>
                  )}
                  {!item.status_jadwal && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Menunggu")}
                    >
                      Set Status
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