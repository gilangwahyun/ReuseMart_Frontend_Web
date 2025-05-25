import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Alert } from "react-bootstrap";
import useAxios from "../../api"; // Import the configured axios instance
import { useNavigate } from "react-router-dom";

const ListTransaksi = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      setError("Anda harus login untuk mengakses halaman ini");
      return;
    }

    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await useAxios.get("/transaksi");
      setTransaksi(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
      if (error.status === 401) {
        setIsAuthenticated(false);
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/LoginPage"), 2000);
      } else {
        setError("Gagal memuat data transaksi. Silakan coba lagi nanti.");
      }
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await useAxios.put(`/transaksi/${id}`, { status_transaksi: newStatus });
      fetchTransaksi(); // Refresh data after update
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.status === 401) {
        setIsAuthenticated(false);
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/LoginPage"), 2000);
      } else {
        setError("Gagal mengubah status transaksi. Silakan coba lagi nanti.");
      }
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return <Badge bg="secondary">Tidak Ada</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "proses":
        return <Badge bg="info">Proses</Badge>;
      case "selesai":
        return <Badge bg="success">Selesai</Badge>;
      case "dibatalkan":
        return <Badge bg="danger">Dibatalkan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Helper to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">
          <Alert.Heading>Akses Dibatasi</Alert.Heading>
          <p>{error || "Anda harus login untuk mengakses halaman ini"}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={() => navigate("/LoginPage")}>
              Login
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Daftar Transaksi</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Pembeli</th>
              <th>Total Harga</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length > 0 ? (
              transaksi.map((item) => {
                // Using the correct field names based on the Transaksi model
                const id = item.id_transaksi;
                const idPembeli = item.id_pembeli;
                const totalHarga = item.total_harga;
                const status = item.status_transaksi;
                const tanggal = item.tanggal_transaksi;
                
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{idPembeli}</td>
                    <td>Rp {totalHarga ? totalHarga.toLocaleString() : '0'}</td>
                    <td>{getStatusBadge(status)}</td>
                    <td>{formatDate(tanggal)}</td>
                    <td>
                      {(!status || status.toLowerCase() === "pending") && (
                        <Button
                          key={`process-${id}`}
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => updateStatus(id, "proses")}
                        >
                          Proses
                        </Button>
                      )}
                      {status && status.toLowerCase() === "proses" && (
                        <Button
                          key={`complete-${id}`}
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => updateStatus(id, "selesai")}
                        >
                          Selesai
                        </Button>
                      )}
                      {(!status || ["pending", "proses"].includes(status.toLowerCase())) && (
                        <Button
                          key={`cancel-${id}`}
                          variant="danger"
                          size="sm"
                          onClick={() => updateStatus(id, "dibatalkan")}
                        >
                          Batalkan
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr key="no-data">
                <td colSpan="6" className="text-center">
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ListTransaksi;
