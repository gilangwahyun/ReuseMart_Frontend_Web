import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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

            <Card className="mb-4">
              <Card.Body>
                <Table bordered responsive>
                  <thead>
                    <tr>
                      <th width="5%">No</th>
                      <th width="10%">ID Organisasi</th>
                      <th width="20%">Nama Organisasi</th>
                      <th width="25%">Alamat Organisasi</th>
                      <th width="40%">Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestDonasi.map((request, idx) => (
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
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default RequestDonasiAll;