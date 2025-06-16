import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";

const VerifikasiPembayaranTable = ({ 
  pembayaranData, 
  handleVerifikasi, 
  loading 
}) => {
  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fungsi untuk menentukan status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sudah Diverifikasi':
        return <Badge bg="success">Sudah Diverifikasi</Badge>;
      case 'Ditolak':
        return <Badge bg="danger">Ditolak</Badge>;
      case 'Belum Diverifikasi':
        return <Badge bg="warning">Belum Diverifikasi</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (!Array.isArray(pembayaranData) || pembayaranData.length === 0) {
    return <div className="alert alert-info">Tidak ada data pembayaran yang perlu diverifikasi.</div>;
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th className="align-middle">No</th>
            <th className="align-middle">ID Pembayaran</th>
            <th className="align-middle">ID Transaksi</th>
            <th className="align-middle">Tanggal Pembayaran</th>
            <th className="align-middle">Total Pembayaran</th>
            <th className="align-middle">Metode Pembayaran</th>
            <th className="align-middle">Bukti Transfer</th>
            <th className="align-middle">Status Verifikasi</th>
            <th className="align-middle">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {pembayaranData.map((item, index) => (
            <tr key={item.id_pembayaran}>
              <td className="align-middle">{index + 1}</td>
              <td className="align-middle">{item.id_pembayaran}</td>
              <td className="align-middle">{item.id_transaksi}</td>
              <td className="align-middle">{formatDate(item.tanggal_pembayaran)}</td>
              <td className="align-middle">{formatCurrency(item.total_pembayaran || item.harga_barang || 0)}</td>
              <td className="align-middle">{item.metode_pembayaran || "Transfer Bank"}</td>
              <td className="align-middle">
                {item.bukti_transfer ? (
                  <img
                    src={item.bukti_transfer}
                    alt="Bukti Transfer"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                    onClick={() => window.open(item.bukti_transfer, '_blank')}
                  />
                ) : (
                  <span className="text-muted">Tidak ada bukti</span>
                )}
              </td>
              <td className="align-middle">{getStatusBadge(item.status_verifikasi)}</td>
              <td className="align-middle">
                <div className="d-flex flex-column gap-2">
                  {item.status_verifikasi === 'Belum Diverifikasi' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="w-100"
                        onClick={() => handleVerifikasi(item.id_pembayaran, 'Sudah Diverifikasi')}
                      >
                        <FaCheck className="me-1" /> Verifikasi
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-100"
                        onClick={() => handleVerifikasi(item.id_pembayaran, 'Ditolak')}
                      >
                        <FaTimes className="me-1" /> Tolak
                      </Button>
                    </>
                  )}
                  <Button
                    variant="info"
                    size="sm"
                    className="w-100"
                    onClick={() => window.open(item.bukti_transfer, '_blank')}
                    disabled={!item.bukti_transfer}
                  >
                    <FaEye className="me-1" /> Lihat Bukti
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default VerifikasiPembayaranTable; 