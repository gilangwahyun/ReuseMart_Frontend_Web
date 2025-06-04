import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Alert, Modal, Form, Spinner, Card, Row, Col } from "react-bootstrap";
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
  const [isDeliveryByCourier, setIsDeliveryByCourier] = useState(true);
  const [timeError, setTimeError] = useState(null);
  
  // States for transaction detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  
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

  // Function to fetch transaction details
  const fetchTransactionDetail = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      // Fetch transaction details
      const transaksiResponse = await useAxios.get(`/transaksi/${id}`);
      setDetailTransaksi(transaksiResponse.data);
      
      // Fetch items in this transaction
      const detailResponse = await useAxios.get(`/detailTransaksi/transaksi/${id}`);
      const items = detailResponse.data;
      
      console.log("Detail items:", items);
      
      // Placeholder image - base64 encoded small gray image with product icon
      const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSI+PHBhdGggZD0iTTE2LjUgOS40bC05LTVWMjFsOSA1VjkuNHoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxNi41IDMuNSA3LjUgOC41IDE2LjUgMTMuNSI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=";
      
      // Fetch item details and images
      const itemsWithDetails = await Promise.all(items.map(async (item) => {
        try {
          // Get barang details
          const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
          const barang = barangResponse.data;
          
          // Get image URL using our new endpoint
          let imageUrl = placeholderImage; // Default to placeholder
          try {
            const imageResponse = await useAxios.get(`/fotoBarang/image/${item.id_barang}`);
            console.log(`Image response for item ${item.id_barang}:`, imageResponse.data);
            
            if (imageResponse.data && imageResponse.data.success && imageResponse.data.url) {
              imageUrl = imageResponse.data.url;
            }
          } catch (imageError) {
            console.error("Error fetching image URL:", imageError);
          }
          
          return {
            ...item,
            barang,
            imageUrl,
            namaBarang: barang?.nama_barang || `Barang #${item.id_barang}`
          };
        } catch (error) {
          console.error(`Error fetching data for item ${item.id_barang}:`, error);
          return {
            ...item,
            imageUrl: placeholderImage,
            namaBarang: `Barang #${item.id_barang}`
          };
        }
      }));
      
      setDetailItems(itemsWithDetails);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setDetailError("Gagal memuat detail transaksi. Silakan coba lagi nanti.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetailModal = async (transaksi) => {
    setShowDetailModal(true);
    await fetchTransactionDetail(transaksi.id_transaksi);
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

  // Function to check if current time is past 4 PM
  const isPastDeadline = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 16; // 16 is 4 PM in 24-hour format
  };

  // Function to get minimum allowed delivery date based on time
  const getMinDeliveryDate = () => {
    const today = new Date();
    // If past 4 PM, minimum date is tomorrow for couriers
    if (isPastDeadline()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    // Otherwise, today is fine
    return today.toISOString().split('T')[0];
  };

  // For any delivery method, don't allow dates in the past
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Function to open jadwal modal
  const openJadwalModal = (transaksi) => {
    setTimeError(null);
    setSelectedTransaksi(transaksi);
    
    // Check shipping method - defaults
    const isCourierDelivery = transaksi.metode_pengiriman === "Dikirim oleh Kurir";
    setIsDeliveryByCourier(isCourierDelivery);
    
    const defaultStatus = isCourierDelivery ? "Sedang Dikirim" : "Menunggu Diambil";
    
    // Set appropriate date based on time
    const minDeliveryDate = getMinDeliveryDate();

    // Show a warning if it's past 4 PM and courier delivery
    if (isCourierDelivery && isPastDeadline()) {
      setTimeError(
        "Pengiriman kurir setelah jam 16:00 akan dijadwalkan untuk besok."
      );
    }
    
    setJadwalData({
      id_transaksi: transaksi.id_transaksi,
      id_pegawai: "", // Reset courier selection
      tanggal: minDeliveryDate,
      status_jadwal: defaultStatus
    });
    
    // Fetch pegawai list only if courier delivery
    if (isCourierDelivery) {
      fetchPegawaiList();
    }
    
    setShowJadwalModal(true);
  };

  // Function to fetch pegawai list
  const fetchPegawaiList = async () => {
    try {
      const response = await getAllPegawai();
      // Filter pegawai who have id_jabatan = 6 (courier)
      const couriers = response.data?.filter(pegawai => 
        pegawai.id_jabatan === 6
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
    setJadwalData({
      ...jadwalData,
      [name]: value
    });
  };

  // Submit jadwal form
  const handleSubmitJadwal = async (e) => {
    e.preventDefault();
    setJadwalLoading(true);
    setJadwalError(null);
    
    try {
      // Validate delivery date for courier deliveries
      if (isDeliveryByCourier && isPastDeadline()) {
        const minAllowedDate = getMinDeliveryDate();
        const selectedDate = jadwalData.tanggal;
        
        if (selectedDate < minAllowedDate) {
          throw new Error("Untuk pengiriman kurir setelah jam 16:00, tanggal pengiriman harus besok atau lebih lambat.");
        }
      }

      // Prepare data based on delivery method
      const formattedData = {
        id_transaksi: jadwalData.id_transaksi,
        tanggal: jadwalData.tanggal,
        status_jadwal: jadwalData.status_jadwal,
        id_pegawai: null // Default to null for all cases
      };
      
      // Override with actual pegawai ID if courier delivery
      if (isDeliveryByCourier) {
        if (!jadwalData.id_pegawai) {
          throw new Error("Kurir harus dipilih untuk pengiriman oleh kurir");
        }
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
        (error.response?.data?.message || error.message));
    } finally {
      setJadwalLoading(false);
    }
  };

  // Function to check if transaction already has jadwal
  const hasJadwal = (transactionId) => {
    return transactionWithJadwal.includes(transactionId);
  };

  // Function to check if we can create jadwal for a transaction
  const canCreateJadwal = (transaction) => {
    // Already has a jadwal
    if (hasJadwal(transaction.id_transaksi)) {
      return false;
    }

    return true;
  };

  // Function to get button tooltip based on transaction status
  const getJadwalButtonTooltip = (transaction) => {
    if (hasJadwal(transaction.id_transaksi)) {
      return "Jadwal sudah dibuat";
    }
    
    if (transaction.metode_pengiriman === "Dikirim oleh Kurir" && isPastDeadline()) {
      return "Jadwal pengiriman kurir setelah jam 16:00 akan dijadwalkan untuk besok";
    }
    
    return "Buat jadwal pengiriman";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
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
      {timeError && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Perhatian!</strong> {timeError}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setTimeError(null)} 
            aria-label="Close"
          ></button>
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No.</th>
              <th>Total Harga</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Metode Pengiriman</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length > 0 ? (
              transaksi.map((item, index) => {
                // Using the correct field names based on the Transaksi model
                const id = item.id_transaksi;
                const totalHarga = item.total_harga;
                const status = item.status_transaksi;
                const tanggal = item.tanggal_transaksi;
                const metodePengiriman = item.metode_pengiriman || "-";
                
                return (
                  <tr key={id}>
                    <td>{index + 1}</td>
                    <td>Rp {totalHarga ? totalHarga.toLocaleString() : '0'}</td>
                    <td>{getStatusBadge(status)}</td>
                    <td>{formatDate(tanggal)}</td>
                    <td>{metodePengiriman}</td>
                    <td>
                      {/* Detail Transaction Button */}
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => openDetailModal(item)}
                      >
                        Detail Transaksi
                      </Button>
                      <br />
                      
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
                          disabled={!canCreateJadwal(item)}
                          title={getJadwalButtonTooltip(item)}
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
                <td colSpan="7" className="text-center">
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
          
          {timeError && (
            <Alert variant="warning" className="mb-3">
              {timeError}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmitJadwal}>
            <Form.Group className="mb-3">
              <Form.Label>Transaksi</Form.Label>
              <Form.Control
                type="text"
                value="Detail Transaksi"
                disabled
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Metode Pengiriman</Form.Label>
              <Form.Control
                type="text"
                value={selectedTransaksi?.metode_pengiriman || ''}
                disabled
              />
            </Form.Group>
            
            {isDeliveryByCourier && (
              <Form.Group className="mb-3">
                <Form.Label>Kurir</Form.Label>
                <Form.Select
                  name="id_pegawai"
                  value={jadwalData.id_pegawai}
                  onChange={handleJadwalInputChange}
                  required={isDeliveryByCourier}
                >
                  <option value="">-- Pilih Kurir --</option>
                  {pegawaiList.map(pegawai => (
                    <option key={pegawai.id_pegawai} value={pegawai.id_pegawai}>
                      {pegawai.nama_pegawai} - {pegawai.no_telepon}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Pengiriman</Form.Label>
              <Form.Control
                type="date"
                name="tanggal"
                value={jadwalData.tanggal}
                onChange={handleJadwalInputChange}
                min={isDeliveryByCourier && isPastDeadline() 
                    ? getMinDeliveryDate() // For courier: today or tomorrow based on time
                    : getTodayDate()} // For mandiri: at least today
                required
              />
              {isDeliveryByCourier && isPastDeadline() && (
                <Form.Text className="text-muted">
                  Pengiriman kurir setelah jam 16:00 hanya bisa dijadwalkan untuk besok atau lebih lambat.
                </Form.Text>
              )}
              {!isDeliveryByCourier && (
                <Form.Text className="text-muted">
                  Pengambilan mandiri hanya bisa dijadwalkan hari ini atau lebih lambat.
                </Form.Text>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status Pengiriman</Form.Label>
              <Form.Select
                name="status_jadwal"
                value={jadwalData.status_jadwal}
                onChange={handleJadwalInputChange}
                required
              >
                {!isDeliveryByCourier && (
                  <option value="Menunggu Diambil">Menunggu Diambil</option>
                )}
                {isDeliveryByCourier && (
                  <>
                    <option value="Sedang Dikirim">Sedang Dikirim</option>
                  </>
                )}
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
      
      {/* Modal for transaction details */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detail Transaksi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Memuat detail transaksi...</p>
            </div>
          ) : detailError ? (
            <Alert variant="danger">{detailError}</Alert>
          ) : detailTransaksi ? (
            <div>
              <h5>Informasi Transaksi</h5>
              <Table bordered size="sm" className="mb-4">
                <tbody>
                  <tr>
                    <th>Tanggal Transaksi</th>
                    <td>{formatDate(detailTransaksi.tanggal_transaksi)}</td>
                  </tr>
                  <tr>
                    <th>Total Harga</th>
                    <td>{formatCurrency(detailTransaksi.total_harga || 0)}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{getStatusBadge(detailTransaksi.status_transaksi)}</td>
                  </tr>
                  <tr>
                    <th>Metode Pengiriman</th>
                    <td>{detailTransaksi.metode_pengiriman || "-"}</td>
                  </tr>
                </tbody>
              </Table>
              
              <h5>Barang dalam Transaksi</h5>
              {detailItems.length > 0 ? (
                <Row>
                  {detailItems.map((item, index) => (
                    <Col md={6} key={item.id_detail_transaksi || index} className="mb-3">
                      <Card>
                        <Row className="g-0">
                          <Col md={4} className="d-flex align-items-center justify-content-center" style={{ background: '#f8f9fa' }}>
                            <div style={{ width: '100%', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img 
                                src={item.imageUrl} 
                                alt={`Foto ${item.namaBarang}`}
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'contain' 
                                }}
                                onError={(e) => {
                                  console.log(`Image load failed for ${item.id_barang}`);
                                  e.target.onerror = null;
                                  // Use inline SVG as fallback for more reliable display
                                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSI+PHBhdGggZD0iTTE2LjUgOS40bC05LTVWMjFsOSA1VjkuNHoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxNi41IDMuNSA3LjUgOC41IDE2LjUgMTMuNSI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=";
                                }}
                              />
                            </div>
                          </Col>
                          <Col md={8}>
                            <Card.Body>
                              <Card.Title className="h6">{item.namaBarang || 'Barang'}</Card.Title>
                              <Card.Text className="small mb-1">
                                <strong>Jumlah:</strong> {item.jumlah || 1}
                              </Card.Text>
                              {item.harga_beli && (
                                <Card.Text className="small mb-1">
                                  <strong>Harga:</strong> {formatCurrency(item.harga_beli)}
                                </Card.Text>
                              )}
                            </Card.Body>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-center text-muted">Tidak ada barang dalam transaksi ini</p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted">Tidak ada detail yang tersedia</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListTransaksi;
