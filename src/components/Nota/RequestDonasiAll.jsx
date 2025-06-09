import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { getAllRequestDonasi } from '../../api/RequestDonasiApi';

const RequestDonasiAll = () => {
  const [requestDonasi, setRequestDonasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printComponentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequestDonasi();
  }, []);

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

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    contentRef: printComponentRef,
    documentTitle: 'Laporan Pengajuan Donasi ReuseMart',
    onBeforeGetContent: () => {
      return new Promise(resolve => {
        console.log("Preparing content to print...");
        console.log("Print ref exists:", !!printComponentRef.current);
        resolve();
      });
    },
    onAfterPrint: () => console.log('Print completed'),
    removeAfterPrint: true,
  });

  const handleBack = () => {
    navigate('/owner/request-donasi');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Group request by organization
  const getOrganizedRequests = () => {
    const organizationMap = new Map();
    
    requestDonasi.forEach(request => {
      if (request.organisasi) {
        const orgId = request.organisasi.id_organisasi;
        const orgName = request.organisasi.nama_organisasi;
        
        if (!organizationMap.has(orgId)) {
          organizationMap.set(orgId, {
            id: orgId,
            name: orgName,
            items: [],
          });
        }
        
        organizationMap.get(orgId).items.push(request);
      } else {
        // For items without organization data
        if (!organizationMap.has('unknown')) {
          organizationMap.set('unknown', {
            id: 'unknown',
            name: 'Tidak Tercatat',
            items: [],
          });
        }
        
        organizationMap.get('unknown').items.push(request);
      }
    });
    
    return Array.from(organizationMap.values());
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const organizedRequests = getOrganizedRequests();
  
  return (
    <Container fluid className="py-4">
      <div className="mb-3 d-print-none">
        <Button variant="secondary" onClick={handleBack} className="me-2">
          &laquo; Kembali
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          Cetak Laporan
        </Button>
      </div>

      {/* Direct rendering with ref */}
      <div ref={printComponentRef} className="p-3" style={{ width: '100%', minHeight: '500px' }}>
        <Card className="p-4 mb-4">
          <Card.Body>
            <div className="text-center mb-4">
              <h2>LAPORAN PENGAJUAN DONASI</h2>
              <h4>ReuseMart</h4>
              <p className="text-muted">Pusat Daur Ulang dan Donasi Barang Bekas</p>
              <p>Tanggal Cetak: {formatDate(new Date())}</p>
            </div>

            {organizedRequests.map((org) => (
              <Card className="mb-4" key={org.id}>
                <Card.Header>
                  <h5>Organisasi: {org.name}</h5>
                </Card.Header>
                <Card.Body>
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>ID Pengajuan</th>
                        <th>Deskripsi</th>
                        <th>Tanggal Pengajuan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.items.map((request, idx) => (
                        <tr key={request.id_request_donasi}>
                          <td>{idx + 1}</td>
                          <td>{request.id_request_donasi}</td>
                          <td>{request.deskripsi}</td>
                          <td>{formatDate(request.tanggal_pengajuan)}</td>
                          <td>
                            <span className={`text-${getStatusBadge(request.status_pengajuan)}`}>
                              {request.status_pengajuan}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))}

            <div className="mt-5 pt-5">
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>Manajer ReuseMart</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <p>Membuat Laporan,</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>Admin Donasi</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default RequestDonasiAll;