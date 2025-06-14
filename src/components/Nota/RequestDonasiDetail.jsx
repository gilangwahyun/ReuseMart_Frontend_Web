import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import useAxios from '../../api';

const RequestDonasiDetail = () => {
  const { id_request } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [organisasi, setOrganisasi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printComponentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await useAxios.get(`/requestDonasi/${id_request}`);
        setRequestData(response.data);
        
        // If we have organisasi data in the response, set it
        if (response.data?.organisasi) {
          setOrganisasi(response.data.organisasi);
        }
      } catch (err) {
        console.error("Error fetching request data:", err);
        setError("Gagal memuat data pengajuan donasi");
      } finally {
        setLoading(false);
      }
    };

    if (id_request) {
      fetchData();
    }
  }, [id_request]);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    contentRef: printComponentRef,
    documentTitle: `Pengajuan Donasi - ${id_request || ''}`,
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
        <span className="ms-2">Memuat data pengajuan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          {error}
          <div className="mt-3">
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Data pengajuan tidak ditemukan.
          <div className="mt-3">
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-3 d-print-none">
        <Button variant="secondary" onClick={handleBack} className="me-2">
          &laquo; Kembali
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          Cetak Detail Pengajuan
        </Button>
      </div>

      <div ref={printComponentRef} className="p-4" style={{ width: '100%', minHeight: '500px' }}>
        <Card className="p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card.Body>
            <div className="text-center mb-4">
              <h3>DETAIL PENGAJUAN DONASI</h3>
              <h5>ReuseMart</h5>
              <p className="text-muted">Pusat Daur Ulang dan Donasi Barang Bekas</p>
              <p>Tanggal Cetak: {formatDate(new Date())}</p>
            </div>

            <Row className="mb-4">
              <Col md={6}>
                <p className="mb-1"><strong>ID Pengajuan:</strong> {requestData.id_request_donasi}</p>
                <p className="mb-1">
                  <strong>Status:</strong>{' '}
                  <Badge bg={getStatusBadge(requestData.status_pengajuan)}>
                    {requestData.status_pengajuan || 'Tidak ada data'}
                  </Badge>
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-1">
                  <strong>Tanggal Pengajuan:</strong> {formatDate(requestData.tanggal_pengajuan)}
                </p>
              </Col>
            </Row>

            <hr />

            <h5 className="mb-3">Informasi Organisasi</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <td width="30%"><strong>Nama Organisasi</strong></td>
                  <td>{organisasi?.nama_organisasi || 'Tidak ada data'}</td>
                </tr>
                <tr>
                  <td><strong>Email</strong></td>
                  <td>{organisasi?.email || 'Tidak ada data'}</td>
                </tr>
                <tr>
                  <td><strong>No. Telepon</strong></td>
                  <td>{organisasi?.no_telepon || 'Tidak ada data'}</td>
                </tr>
                <tr>
                  <td><strong>Alamat</strong></td>
                  <td>{organisasi?.alamat || 'Tidak ada data'}</td>
                </tr>
              </tbody>
            </Table>

            <hr />

            <h5 className="mb-3">Detail Pengajuan</h5>
            <div className="p-3 bg-light rounded">
              <p className="font-weight-bold">Deskripsi Pengajuan:</p>
              <p>{requestData.deskripsi || 'Tidak ada deskripsi'}</p>
            </div>

            <div className="mt-5 pt-5">
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <p>Pihak ReuseMart</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>Admin Donasi</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <p>Pihak Pengaju</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>{organisasi?.nama_organisasi || 'Organisasi'}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default RequestDonasiDetail; 