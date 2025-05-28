import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Badge, Alert } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { getAllPembayaranCS, updateStatusVerifikasi } from '../../api/PembayaranApi';

const VerifikasiPembayaranCS = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleViewDetails = (item) => {
    setSelectedPembayaran(item);
    setShowModal(true);
  };

  const handleVerifikasi = async (id, status) => {
    try {
      await updateStatusVerifikasi(id, status);
      // Refresh data after update
      fetchPembayaran();
      setShowModal(false);
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

  if (loading) {
    return (
      <Container className="py-4">
        <Alert variant="info">Memuat data...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Verifikasi Pembayaran</h2>

      <Card>
        <Card.Body>
          <Table responsive hover>
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifikasiPembayaranCS;