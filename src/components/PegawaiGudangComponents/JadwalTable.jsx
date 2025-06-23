import React from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const JadwalTable = ({ 
  jadwal, 
  loading, 
  updateStatusJadwal, 
  handleCetakNota,
  processingStatus
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Tidak Ada</Badge>;

    switch (status) {
      case "Menunggu Diambil":
        return <Badge bg="warning">Menunggu Diambil</Badge>;
      case "Sedang Dikirim":
        return <Badge bg="info">Sedang Dikirim</Badge>;
      case "Sedang di Kurir":
        return <Badge bg="primary">Sedang di Kurir</Badge>;
      case "Sudah Diambil":
        return <Badge bg="success">Sudah Diambil</Badge>;
      case "Sudah Sampai":
        return <Badge bg="success">Sudah Sampai</Badge>;
      case "Selesai":
        return <Badge bg="success">Selesai</Badge>;
      case "Hangus":
        return <Badge bg="danger">Hangus</Badge>;
      case "Dibatalkan":
        return <Badge bg="danger">Dibatalkan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const isCourierDelivery = (item) => {
    return item && item.pegawai && item.id_pegawai;
  };
  
  const handleStatusUpdate = (jadwalId, newStatus) => {
    console.log(`JadwalTable: handleStatusUpdate called with jadwalId=${jadwalId}, newStatus=${newStatus}`);
    updateStatusJadwal(jadwalId, newStatus);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Memuat data jadwal...</span>
      </div>
    );
  }

  if (!Array.isArray(jadwal) || jadwal.length === 0) {
    return (
      <div className="alert alert-info">
        Tidak ada data jadwal pengiriman ditemukan.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th className="align-middle">No.</th>
            <th className="align-middle">ID Jadwal</th>
            <th className="align-middle">ID Transaksi</th>
            <th className="align-middle">Kurir</th>
            <th className="align-middle">Tanggal</th>
            <th className="align-middle">Status</th>
            <th className="align-middle">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {jadwal.map((item, index) => (
            <tr key={item.id_jadwal}>
              <td className="align-middle">{index + 1}</td>
              <td className="align-middle">{item.id_jadwal}</td>
              <td className="align-middle">{item.id_transaksi}</td>
              <td className="align-middle">
                {item.pegawai ? (
                  <>
                    <div>{item.pegawai.nama_pegawai}</div>
                    <small className="text-muted">{item.pegawai.no_telepon}</small>
                  </>
                ) : (
                  "Diambil Mandiri"
                )}
              </td>
              <td className="align-middle">
                {formatDate(item.tanggal)}
              </td>
              <td className="align-middle">{getStatusBadge(item.status_jadwal)}</td>
              <td className="align-middle">
                <div className="d-flex flex-column gap-2">
                  {item.status_jadwal === "Sedang Dikirim" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-100"
                        onClick={() => handleStatusUpdate(item.id_jadwal, "Sedang di Kurir")}
                        disabled={processingStatus}
                        title="Tandai barang sedang di kurir dan kirim notifikasi"
                      >
                        Tandai Sedang di Kurir
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        className="w-100"
                        onClick={() => handleStatusUpdate(item.id_jadwal, "Sudah Sampai")}
                        disabled={processingStatus}
                        title="Tandai barang sudah sampai dan kirim notifikasi"
                      >
                        Tandai Sudah Sampai
                      </Button>
                    </>
                  )}
                  
                  {item.status_jadwal === "Menunggu Diambil" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="w-100"
                      onClick={() => handleStatusUpdate(item.id_jadwal, "Sudah Diambil")}
                      disabled={processingStatus}
                      title="Tandai barang sudah diambil dan kirim notifikasi"
                    >
                      Tandai Sudah Diambil
                    </Button>
                  )}
                  
                  {item.status_jadwal === "Sedang di Kurir" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="w-100"
                      onClick={() => handleStatusUpdate(item.id_jadwal, "Sudah Sampai")}
                      disabled={processingStatus}
                      title="Tandai barang sudah sampai dan kirim notifikasi"
                    >
                      Tandai Sudah Sampai
                    </Button>
                  )}
                  
                  {(item.status_jadwal !== "Sudah Sampai" && 
                    item.status_jadwal !== "Selesai" && 
                    item.status_jadwal !== "Hangus" && 
                    item.status_jadwal !== "Sudah Diambil") && (
                    <Button
                      variant="info"
                      size="sm"
                      className="w-100"
                      onClick={() => handleCetakNota(item.id_jadwal)}
                      title={isCourierDelivery(item) ? "Cetak nota pengiriman" : "Cetak nota pengambilan"}
                    >
                      <i className="bi bi-printer"></i> Cetak Nota
                    </Button>
                  )}
                  
                  {(item.status_jadwal === "Sudah Sampai" || 
                    item.status_jadwal === "Selesai" || 
                    item.status_jadwal === "Sudah Diambil" || 
                    item.status_jadwal === "Hangus") && (
                    <Button
                      variant="info"
                      size="sm"
                      className="w-100"
                      onClick={() => handleCetakNota(item.id_jadwal)}
                      title="Cetak nota"
                    >
                      <i className="bi bi-printer"></i> Cetak Nota
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

export default JadwalTable; 