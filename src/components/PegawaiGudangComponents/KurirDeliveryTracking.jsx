import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Alert, Spinner, Card, Form } from "react-bootstrap";
import useAxios from "../../api";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTruck, FaCalendarAlt } from "react-icons/fa";

const KurirDeliveryTracking = () => {
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJadwalData();
  }, []);

  const fetchJadwalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all jadwal data
      const response = await useAxios.get("/jadwal");
      
      // Filter jadwal by status: only get those with "Sedang Dikirim" or "Sedang di Kurir" status
      const filteredJadwal = response.data.filter(
        jadwal => jadwal.status_jadwal === "Sedang Dikirim" || jadwal.status_jadwal === "Sedang di Kurir"
      );
      
      // Fetch additional data for each jadwal
      const jadwalWithDetails = await Promise.all(
        filteredJadwal.map(async (jadwal) => {
          try {
            // Get transaction details
            const transaksiResponse = await useAxios.get(`/transaksi/${jadwal.id_transaksi}`);
            const transaksi = transaksiResponse.data;
            
            // Get courier details if available
            let courier = null;
            if (jadwal.id_pegawai) {
              try {
                const pegawaiResponse = await useAxios.get(`/pegawai/${jadwal.id_pegawai}`);
                courier = pegawaiResponse.data;
              } catch (error) {
                console.error(`Error fetching courier data for jadwal ${jadwal.id_jadwal}:`, error);
              }
            }
            
            return {
              ...jadwal,
              transaksi,
              courier
            };
          } catch (error) {
            console.error(`Error fetching details for jadwal ${jadwal.id_jadwal}:`, error);
            return jadwal;
          }
        })
      );
      
      setJadwalList(jadwalWithDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jadwal data:", error);
      setError("Gagal memuat data pengiriman kurir. Silakan coba lagi nanti.");
      setLoading(false);
    }
  };

  const updateJadwalStatus = async (jadwalId, newStatus) => {
    try {
      const jadwal = jadwalList.find(j => j.id_jadwal === jadwalId);
      if (!jadwal) {
        console.error(`Jadwal with ID ${jadwalId} not found`);
        return;
      }
      
      await useAxios.put(`/jadwal/${jadwalId}`, {
        id_transaksi: jadwal.id_transaksi,
        id_pegawai: jadwal.id_pegawai,
        tanggal: jadwal.tanggal,
        status_jadwal: newStatus
      });
      
      // Refresh data
      fetchJadwalData();
    } catch (error) {
      console.error("Error updating jadwal status:", error);
      setError("Gagal mengubah status pengiriman. Silakan coba lagi nanti.");
    }
  };

  const handlePrintShippingNote = (jadwalId) => {
    navigate(`/pegawaiGudang/nota-pengiriman/${jadwalId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Sedang Dikirim":
        return <Badge bg="info">Sedang Dikirim</Badge>;
      case "Sedang di Kurir":
        return <Badge bg="primary">Sedang di Kurir</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Filter and search functionality
  const filteredJadwal = jadwalList.filter(jadwal => {
    // Filter by status if needed
    if (filterStatus !== "all" && jadwal.status_jadwal !== filterStatus) {
      return false;
    }
    
    // Search functionality
    if (searchTerm.trim() === "") {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in transaction ID
    if (jadwal.id_transaksi && jadwal.id_transaksi.toString().includes(searchLower)) {
      return true;
    }
    
    // Search in courier name if available
    if (jadwal.courier && jadwal.courier.nama && 
        jadwal.courier.nama.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in customer name if available
    if (jadwal.transaksi && jadwal.transaksi.pembeli && 
        jadwal.transaksi.pembeli.nama && 
        jadwal.transaksi.pembeli.nama.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in delivery address if available
    if (jadwal.transaksi && jadwal.transaksi.alamat && 
        jadwal.transaksi.alamat.alamat_lengkap && 
        jadwal.transaksi.alamat.alamat_lengkap.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h2 className="mb-4">
            <FaTruck className="me-2" />
            Tracking Pengiriman Kurir
          </h2>
          
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="d-flex mb-3 mb-md-0">
              <Form.Group className="me-3" style={{ width: "200px" }}>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="Sedang Dikirim">Sedang Dikirim</option>
                  <option value="Sedang di Kurir">Sedang di Kurir</option>
                </Form.Select>
              </Form.Group>
              
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch 
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6c757d"
                  }}
                />
              </div>
            </div>
            
            <Button 
              variant="outline-primary"
              onClick={() => fetchJadwalData()}
              disabled={loading}
            >
              <FaCalendarAlt className="me-1" /> Refresh Data
            </Button>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Memuat data pengiriman...</p>
            </div>
          ) : filteredJadwal.length === 0 ? (
            <Alert variant="info">
              Tidak ada pengiriman yang sedang berlangsung saat ini.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>ID Jadwal</th>
                    <th>ID Transaksi</th>
                    <th>Tanggal Jadwal</th>
                    <th>Status</th>
                    <th>Kurir</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJadwal.map((jadwal) => (
                    <tr key={jadwal.id_jadwal}>
                      <td>{jadwal.id_jadwal}</td>
                      <td>{jadwal.id_transaksi}</td>
                      <td>{formatDate(jadwal.tanggal)}</td>
                      <td>{getStatusBadge(jadwal.status_jadwal)}</td>
                      <td>
                        {jadwal.courier ? jadwal.courier.nama : "Tidak ditugaskan"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-success"
                            size="sm"
                            onClick={() => updateJadwalStatus(jadwal.id_jadwal, "Sudah Sampai")}
                          >
                            Tandai Sudah Sampai
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePrintShippingNote(jadwal.id_jadwal)}
                          >
                            Cetak Nota
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default KurirDeliveryTracking; 