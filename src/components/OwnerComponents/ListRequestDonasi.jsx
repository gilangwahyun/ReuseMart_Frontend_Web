import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Form, Button, Card, Container, Badge, Spinner, Alert } from 'react-bootstrap';
import { getAllRequestDonasi, searchRequestDonasi } from '../../api/RequestDonasiApi';
import { format } from 'date-fns';

const ListRequestDonasi = () => {
  const [requestDonasi, setRequestDonasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRequestDonasi();
  }, []);

  const fetchRequestDonasi = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRequestDonasi();
      console.log("Fetched request donasi:", data);
      setRequestDonasi(data || []);
    } catch (err) {
      console.error("Error fetching request donasi:", err);
      setError("Gagal memuat data pengajuan donasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      return fetchRequestDonasi();
    }
    
    try {
      setLoading(true);
      // This is assuming you will create this API function. If not, modify accordingly.
      const data = await searchRequestDonasi(searchKeyword);
      setRequestDonasi(data || []);
    } catch (err) {
      console.error("Error searching request donasi:", err);
      setError("Pencarian pengajuan donasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAll = () => {
    // Navigate to the comprehensive report page
    navigate('/owner/request-donasi/print-all');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Get badge variant based on status
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

  // Count organizations
  const getOrganizationCount = () => {
    const organizations = new Set();
    requestDonasi.forEach(request => {
      if (request.organisasi?.nama_organisasi) {
        organizations.add(request.organisasi.nama_organisasi);
      }
    });
    return organizations.size;
  };

  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Daftar Pengajuan Donasi</h4>
      
      {statusMessage && (
        <Alert 
          variant={statusMessage.type} 
          onClose={() => setStatusMessage(null)} 
          dismissible
          className="mb-3"
        >
          {statusMessage.text}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <Form className="d-flex flex-grow-1">
            <Form.Group className="me-2 flex-grow-1">
              <Form.Control
                type="text"
                placeholder="Cari pengajuan donasi"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSearch}>Cari</Button>
            <Button variant="secondary" className="ms-2" onClick={fetchRequestDonasi}>Reset</Button>
          </Form>
          
          <Button 
            variant="success" 
            className="ms-3"
            onClick={handlePrintAll}
            disabled={requestDonasi.length === 0}
          >
            Cetak Laporan Pengajuan
          </Button>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Memuat data pengajuan donasi...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="mb-3">
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Total {requestDonasi.length} pengajuan donasi dari {getOrganizationCount()} organisasi
            </Alert>
          </div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID Pengajuan</th>
                <th>Organisasi</th>
                <th>Deskripsi</th>
                <th>Tanggal Pengajuan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requestDonasi.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">Tidak ada data pengajuan donasi</td>
                </tr>
              ) : (
                requestDonasi.map((request) => (
                  <tr key={request.id_request_donasi}>
                    <td>{request.id_request_donasi}</td>
                    <td>{request.organisasi?.nama_organisasi || 'Tidak ada data'}</td>
                    <td>{request.deskripsi}</td>
                    <td>{formatDate(request.tanggal_pengajuan)}</td>
                    <td>
                      <Badge bg={getStatusBadge(request.status_pengajuan)}>
                        {request.status_pengajuan}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/owner/request-donasi/detail/${request.id_request_donasi}`)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default ListRequestDonasi; 