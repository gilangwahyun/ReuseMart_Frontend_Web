import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Alert, Modal, Form, Spinner } from "react-bootstrap";
import useAxios from "../../api"; // Import the configured axios instance
import { useNavigate } from "react-router-dom";
import { getAllPegawai } from "../../api/PegawaiApi";
import { createJadwal } from "../../api/JadwalApi";

const ListTransaksi = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();
  
  // States for jadwal creation
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [jadwalData, setJadwalData] = useState({
    id_transaksi: "",
    id_pegawai: "",
    tanggal: "",
    status_jadwal: "Sedang Dikirim"
  });
  const [jadwalLoading, setJadwalLoading] = useState(false);
  const [jadwalError, setJadwalError] = useState(null);
  const [jadwalSuccess, setJadwalSuccess] = useState(null);
  
  // State to track which transactions already have jadwal
  const [transactionWithJadwal, setTransactionWithJadwal] = useState([]);

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
    fetchJadwalData();
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

  // Fetch all jadwal data to know which transactions already have jadwal
  const fetchJadwalData = async () => {
    try {
      const response = await useAxios.get("/jadwal");
      // Extract transaction IDs that already have jadwal
      const transactionIds = response.data.map(jadwal => jadwal.id_transaksi);
      setTransactionWithJadwal(transactionIds);
    } catch (error) {
      console.error("Error fetching jadwal data:", error);
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
      case "lunas":
        return <Badge bg="success">Lunas</Badge>;
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

  // Function to open jadwal modal
  const openJadwalModal = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setJadwalData({
      ...jadwalData,
      id_transaksi: transaksi.id_transaksi,
      tanggal: new Date().toISOString().split('T')[0],
      status_jadwal: "Sedang Dikirim" // Default to "Sedang Dikirim"
    });
    
    // Fetch pegawai list for dropdown
    fetchPegawaiList();
    
    setShowJadwalModal(true);
  };

  // Function to fetch pegawai list
  const fetchPegawaiList = async () => {
    try {
      const response = await getAllPegawai();
      // Filter pegawai who are couriers (assuming job role "Kurir")
      const couriers = response.data?.filter(pegawai => 
        pegawai.jabatan?.nama_jabatan?.toLowerCase() === "kurir"
      ) || [];
      setPegawaiList(couriers);
    } catch (error) {
      console.error("Error fetching pegawai:", error);
      setJadwalError("Gagal memuat data kurir. Silakan coba lagi nanti.");
    }
  };

  // Handle jadwal form input changes
  const handleJadwalInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'status_jadwal' && value === 'Menunggu Diambil') {
      // If changing status to "Menunggu Diambil", clear the kurir field
      setJadwalData({
        ...jadwalData,
        [name]: value,
        id_pegawai: '' // Clear the pegawai field since it's not needed
      });
    } else {
      setJadwalData({
        ...jadwalData,
        [name]: value
      });
    }
  };

  // Submit jadwal form
  const handleSubmitJadwal = async (e) => {
    e.preventDefault();
    setJadwalLoading(true);
    setJadwalError(null);
    
    try {
      // Prepare data based on status
      const formattedData = {
        id_transaksi: jadwalData.id_transaksi,
        tanggal: jadwalData.tanggal,
        status_jadwal: jadwalData.status_jadwal
      };
      
      // Only include id_pegawai if not "Menunggu Diambil"
      if (jadwalData.status_jadwal !== "Menunggu Diambil") {
        formattedData.id_pegawai = jadwalData.id_pegawai;
      }
      
      console.log('Submitting jadwal data:', formattedData);
      
      const response = await createJadwal(formattedData);
      console.log('Jadwal creation response:', response);
      
      setJadwalSuccess("Jadwal pengiriman berhasil dibuat!");
      
      // Update UI
      fetchTransaksi();
      fetchJadwalData();
      
      // Clear form and close modal after short delay
      setTimeout(() => {
        setShowJadwalModal(false);
        setJadwalSuccess(null);
        setJadwalData({
          id_transaksi: "",
          id_pegawai: "",
          tanggal: new Date().toISOString().split('T')[0],
          status_jadwal: "Sedang Dikirim"
        });
      }, 1500);
    } catch (error) {
      console.error("Error creating jadwal:", error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      setJadwalError("Gagal membuat jadwal pengiriman: " + 
        (error.response?.data?.message || "Terjadi kesalahan pada server"));
    } finally {
      setJadwalLoading(false);
    }
  };

  // Function to check if transaction already has jadwal
  const hasJadwal = (transactionId) => {
    return transactionWithJadwal.includes(transactionId);
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
                      {status && status.toLowerCase() === "lunas" && (
                        <Button
                          key={`jadwal-${id}`}
                          variant="info"
                          size="sm"
                          onClick={() => openJadwalModal(item)}
                          disabled={hasJadwal(id)}
                        >
                          {hasJadwal(id) ? 'Jadwal Sudah Dibuat' : 'Buat Jadwal Pengiriman'}
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
      
      {/* Modal for creating jadwal */}
      <Modal show={showJadwalModal} onHide={() => setShowJadwalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buat Jadwal Pengiriman</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {jadwalSuccess && (
            <Alert variant="success" className="mb-3">
              {jadwalSuccess}
            </Alert>
          )}
          
          {jadwalError && (
            <Alert variant="danger" className="mb-3">
              {jadwalError}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmitJadwal}>
            <Form.Group className="mb-3">
              <Form.Label>ID Transaksi</Form.Label>
              <Form.Control
                type="text"
                value={selectedTransaksi?.id_transaksi || ''}
                disabled
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Kurir</Form.Label>
              <Form.Select
                name="id_pegawai"
                value={jadwalData.id_pegawai}
                onChange={handleJadwalInputChange}
                required={jadwalData.status_jadwal !== "Menunggu Diambil"}
                disabled={jadwalData.status_jadwal === "Menunggu Diambil"}
              >
                <option value="">-- Pilih Kurir --</option>
                {pegawaiList.map(pegawai => (
                  <option key={pegawai.id_pegawai} value={pegawai.id_pegawai}>
                    {pegawai.nama_pegawai} - {pegawai.no_telepon}
                  </option>
                ))}
              </Form.Select>
              {jadwalData.status_jadwal === "Menunggu Diambil" && (
                <small className="text-muted">
                  Kurir tidak diperlukan untuk status Menunggu Diambil
                </small>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Pengiriman</Form.Label>
              <Form.Control
                type="date"
                name="tanggal"
                value={jadwalData.tanggal}
                onChange={handleJadwalInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status Pengiriman</Form.Label>
              <Form.Select
                name="status_jadwal"
                value={jadwalData.status_jadwal}
                onChange={handleJadwalInputChange}
                required
              >
                <option value="Menunggu">Menunggu Diambil</option>
                <option value="Sedang Dikirim">Sedang Dikirim</option>
                <option value="Sudah Diambil">Sudah Diambil</option>
                <option value="Sudah Sampai">Sudah Sampai</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowJadwalModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={jadwalLoading}>
                {jadwalLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-1">Menyimpan...</span>
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListTransaksi;
