import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Container, Row, Col, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import { format } from 'date-fns';
import { getAllRequestDonasi } from '../../api/RequestDonasiApi';
import OwnerSidebar from '../../components/OwnerSideBar';

const RequestDonasiPageContent = () => {
  const [requestDonasi, setRequestDonasi] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequestDonasi();
  }, []);

  useEffect(() => {
    // Apply filters whenever requestDonasi, filterStatus or searchTerm change
    applyFilters();
  }, [requestDonasi, filterStatus, searchTerm]);

  const fetchRequestDonasi = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRequestDonasi();
      setRequestDonasi(data || []);
    } catch (err) {
      console.error("Error fetching request donasi:", err);
      setError("Gagal memuat data pengajuan donasi");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...requestDonasi];
    
    // Filter by status if selected
    if (filterStatus) {
      results = results.filter(request => 
        request.status_pengajuan?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(request => 
        request.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.organisasi?.nama_organisasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.organisasi?.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRequests(results);
  };

  const handlePrintReport = () => {
    // Navigate to the print-all page for Request Donasi
    navigate('/owner/request-donasi/print-all');
  };

  const refreshData = () => {
    fetchRequestDonasi();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'disetujui':
        return 'success';
      case 'ditolak':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Memuat data pengajuan donasi...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="secondary" onClick={refreshData}>
              Coba Lagi
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const displayRequests = filteredRequests.length > 0 ? filteredRequests : requestDonasi;
  const totalRequests = displayRequests.length;
  
  return (
    <Container fluid className="py-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Data Pengajuan Donasi</h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Filter Status</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Cari Pengajuan</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Cari berdasarkan deskripsi atau nama organisasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col lg={4} className="d-flex align-items-end mb-3">
              <Button variant="success" onClick={refreshData} className="me-2">
                <i className="fas fa-sync-alt"></i> Refresh
              </Button>
              <Button 
                variant="primary" 
                onClick={handlePrintReport} 
                disabled={totalRequests === 0}
              >
                <i className="fas fa-print"></i> Cetak Laporan
              </Button>
            </Col>
          </Row>

          <Alert variant="info" className="mb-3">
            Total Data: <strong>{totalRequests}</strong> pengajuan donasi
          </Alert>
        </Card.Body>
      </Card>

      {displayRequests.length > 0 ? (
        <Card className="mb-4">
          <Card.Body>
            <Table bordered responsive hover>
              <thead className="table-light">
                <tr>
                  <th width="5%">No</th>
                  <th width="10%">ID Organisasi</th>
                  <th width="20%">Nama Organisasi</th>
                  <th width="25%">Alamat Organisasi</th>
                  <th width="40%">Request</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((request, idx) => (
                  <tr key={request.id_request_donasi}>
                    <td>{idx + 1}</td>
                    <td>{request.organisasi?.id_organisasi || "-"}</td>
                    <td>{request.organisasi?.nama_organisasi || "-"}</td>
                    <td>{request.organisasi?.alamat || "-"}</td>
                    <td>{request.deskripsi || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="warning">
          Tidak ada data pengajuan donasi yang ditemukan dengan filter yang dipilih.
        </Alert>
      )}
    </Container>
  );
};

const RequestDonasiPage = () => {
  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="w-100">
        <RequestDonasiPageContent />
      </div>
    </div>
  );
};

export default RequestDonasiPage;