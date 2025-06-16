import React from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const TransaksiTable = ({ 
  transaksi, 
  openDetailModal, 
  openJadwalModal, 
  updateStatus,
  hasJadwal,
  canCreateJadwal,
  getJadwalButtonTooltip,
  loading
}) => {
  const navigate = useNavigate();

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Fungsi untuk mendapatkan badge status transaksi
  const getStatusBadge = (status) => {
    if (!status) {
      return <Badge bg="secondary">Tidak Ada</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "proses":
        return <Badge bg="info">Proses</Badge>;
      case "selesai":
        return <Badge bg="success">Selesai</Badge>;
      case "dibatalkan":
        return <Badge bg="danger">Dibatalkan</Badge>;
      case "lunas":
        return <Badge bg="success">Lunas</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" role="status" />
        <span className="ms-2">Memuat data transaksi...</span>
      </div>
    );
  }

  if (!Array.isArray(transaksi) || transaksi.length === 0) {
    return (
      <div className="alert alert-info">
        Tidak ada data transaksi ditemukan.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th className="align-middle">No.</th>
            <th className="align-middle">ID Transaksi</th>
            <th className="align-middle">Nama Barang</th>
            <th className="align-middle">Total Harga</th>
            <th className="align-middle">Status</th>
            <th className="align-middle">Tanggal</th>
            <th className="align-middle">Metode Pengiriman</th>
            <th className="align-middle">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {transaksi.map((item, index) => (
            <tr key={item.id_transaksi}>
              <td className="align-middle">{index + 1}</td>
              <td className="align-middle">{item.id_transaksi}</td>
              <td className="align-middle">{item.nama_barang}</td>
              <td className="align-middle">Rp {item.total_harga ? item.total_harga.toLocaleString() : '0'}</td>
              <td className="align-middle">{getStatusBadge(item.status_transaksi)}</td>
              <td className="align-middle">{formatDate(item.tanggal_transaksi)}</td>
              <td className="align-middle">{item.metode_pengiriman || "-"}</td>
              <td className="align-middle">
                <div className="d-flex flex-column gap-2">
                  {/* Detail Transaction Button */}
                  <Button
                    variant="info"
                    size="sm"
                    className="w-100"
                    onClick={() => openDetailModal(item)}
                  >
                    Detail Transaksi
                  </Button>
                  
                  {/* Conditional buttons based on status */}
                  {(!item.status_transaksi || item.status_transaksi.toLowerCase() === "pending") && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={() => updateStatus(item.id_transaksi, "proses")}
                    >
                      Proses
                    </Button>
                  )}
                  
                  {item.status_transaksi && item.status_transaksi.toLowerCase() === "proses" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="w-100"
                      onClick={() => updateStatus(item.id_transaksi, "selesai")}
                    >
                      Selesai
                    </Button>
                  )}
                  
                  {(!item.status_transaksi || ["pending", "proses"].includes(item.status_transaksi.toLowerCase())) && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-100"
                      onClick={() => updateStatus(item.id_transaksi, "dibatalkan")}
                    >
                      Batalkan
                    </Button>
                  )}
                  
                  {item.status_transaksi && item.status_transaksi.toLowerCase() === "lunas" && (
                    <Button
                      variant="info"
                      size="sm"
                      className="w-100"
                      onClick={() => openJadwalModal(item)}
                      disabled={!canCreateJadwal(item)}
                      title={getJadwalButtonTooltip(item)}
                    >
                      {hasJadwal(item.id_transaksi) ? 'Jadwal Sudah Dibuat' : 'Buat Jadwal Pengiriman'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TransaksiTable; 