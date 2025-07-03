import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, InputGroup, Form, Button } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaEye, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../api';
import PenitipSidebar from '../../components/PenitipSidebar';

const PengambilanBarang = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No user data found in localStorage');
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      return parsedUser;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  const user = getUserData();
  const id_penitip = user?.id_penitip;

  // Fetch request pengambilan data for the current penitip
  const fetchRequestPengambilanData = async () => {
    if (!id_penitip) {
      setError('Data penitip tidak ditemukan');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/request-pengambilan/penitip/${id_penitip}`);
      console.log('Request pengambilan data:', response.data);
      setRequests(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching request pengambilan data:', error);
      setError('Gagal memuat data request pengambilan: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRequestPengambilanData();
  }, [id_penitip]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge based on request status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge bg="warning">Menunggu Persetujuan</Badge>;
      case "Disetujui":
        return <Badge bg="success">Disetujui</Badge>;
      case "Selesai":
        return <Badge bg="secondary">Sudah Diambil</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Filter requests based on search term and only show approved items
  const filteredRequests = requests.filter(request => {
    // Only include items with "Disetujui" status
    if (request.status !== "Disetujui") {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.barang?.nama_barang && request.barang.nama_barang.toLowerCase().includes(searchLower)) ||
      (request.status && request.status.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="d-flex">
      <PenitipSidebar />
      
      <Container fluid className="py-4 flex-grow-1">
        <Row>
          <Col>
            {/* Header Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0 text-success">Pengambilan Barang</h2>
                    <p className="text-muted mb-0">Daftar barang yang sudah disetujui untuk diambil</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Success message */}
            {successMessage && (
              <Alert 
                variant="success" 
                className="mb-4" 
                dismissible 
                onClose={() => setSuccessMessage("")}
              >
                {successMessage}
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert 
                variant="danger" 
                className="mb-4" 
                dismissible 
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* Search input */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Cari berdasarkan nama barang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Card.Body>
            </Card>

            {/* Data table */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Memuat data...</span>
                </div>
                <p className="mt-2">Memuat data pengambilan barang...</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              <Card className="shadow-sm">
                <Table responsive striped hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>No.</th>
                      <th>Barang</th>
                      <th>Tanggal Request</th>
                      <th>Tanggal Pengambilan</th>
                      <th>Status Persetujuan</th>
                      <th>Status Barang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, index) => (
                      <tr key={request.id}>
                        <td>{index + 1}</td>
                        <td>
                          {request.barang?.nama_barang || "-"}
                          {request.barang?.kategori?.nama_kategori && (
                            <div><small className="text-muted">{request.barang.kategori.nama_kategori}</small></div>
                          )}
                        </td>
                        <td>{formatDate(request.tanggal_request)}</td>
                        <td>{formatDate(request.tanggal_pengambilan)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>
                          <Badge bg={
                            request.barang?.status_barang === "Sudah Diambil" ? "success" :
                            request.barang?.status_barang === "Tersedia" ? "primary" : "secondary"
                          }>
                            {request.barang?.status_barang || "-"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <Card.Body className="text-center py-5">
                  <FaBoxOpen className="text-muted mb-3" size={40} />
                  <p className="mb-0 text-muted">
                    {searchTerm
                      ? "Tidak ada data pengambilan yang sesuai dengan pencarian."
                      : "Belum ada request pengambilan barang."}
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PengambilanBarang; 