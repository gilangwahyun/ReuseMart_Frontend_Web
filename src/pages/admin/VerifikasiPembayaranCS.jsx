import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { getAllPembayaranCS, updateStatusVerifikasi } from '../../api/PembayaranApi';
import CSSidebar from '../../components/CSSidebar';

const VerifikasiPembayaranCS = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const fetchPembayaran = async () => {
    try {
      const response = await getAllPembayaranCS();
      setPembayaran(response.data);
      setLoading(false);
    } catch (error) {
      setError('Gagal memuat data pembayaran');
      setLoading(false);
    }
  };

  const handleVerifikasi = async (id, status) => {
    try {
      await updateStatusVerifikasi(id, status);
      // Refresh data after update
      fetchPembayaran();
      setSuccessMessage(`Pembayaran berhasil ${status === 'Sudah Diverifikasi' ? 'diverifikasi' : 'ditolak'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Gagal memperbarui status verifikasi');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Belum Diverifikasi': 'warning',
      'Sudah Diverifikasi': 'success',
      'Ditolak': 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="d-flex">
      <CSSidebar />
      
      <Container fluid className="py-4 flex-grow-1">
        <Row>
          <Col>
            {/* Header Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0 text-primary">Verifikasi Pembayaran</h2>
                    <p className="text-muted mb-0">Verifikasi pembayaran transaksi pelanggan</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Main Content */}
            {loading ? (
              <div className="text-center py-5">Memuat data...</div>
            ) : error ? (
              <Alert variant="danger" className="my-3">
                {error}
              </Alert>
            ) : (
              <>
                {/* Success Message */}
                {successMessage && (
                  <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}
                
                {/* Data Table */}
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white py-3">
                    <h5 className="mb-0">Daftar Pembayaran</h5>
                  </Card.Header>
                  <Card.Body>
                    {pembayaran.length > 0 ? (
                      <Table responsive striped hover className="mb-0">
                        <thead>
                          <tr>
                            <th>ID Transaksi</th>
                            <th>Tanggal Pembayaran</th>
                            <th>Total Pembayaran</th>
                            <th>Bukti Transfer</th>
                            <th>Status</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pembayaran.map((item) => (
                            <tr key={item.id_pembayaran}>
                              <td>{item.id_transaksi}</td>
                              <td>{new Date(item.tanggal_pembayaran).toLocaleDateString('id-ID')}</td>
                              <td>Rp {item.harga_barang.toLocaleString()}</td>
                              <td>
                                <img
                                  src={item.bukti_transfer}
                                  alt="Bukti Transfer"
                                  style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                  }}
                                  onClick={() => window.open(item.bukti_transfer, '_blank')}
                                />
                              </td>
                              <td>{getStatusBadge(item.status_verifikasi)}</td>
                              <td>
                                {item.status_verifikasi === 'Belum Diverifikasi' && (
                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleVerifikasi(item.id_pembayaran, 'Ditolak')}
                                    >
                                      <FaTimes /> Tolak
                                    </Button>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleVerifikasi(item.id_pembayaran, 'Sudah Diverifikasi')}
                                    >
                                      <FaCheck /> Verifikasi
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <p className="mb-0 text-muted">Tidak ada pembayaran yang perlu diverifikasi.</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifikasiPembayaranCS;