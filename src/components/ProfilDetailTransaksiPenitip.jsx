import { useEffect, useState } from "react";
import { getDetailTransaksiByTransaksi } from "../api/DetailTransaksiApi";
import {
  Card, Button, Row, Col, ListGroup, Alert, Spinner, Badge
} from 'react-bootstrap';
import { FaArrowLeft, FaCalendar, FaMoneyBillWave, FaBoxOpen, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

export default function ProfilDetailTransaksiPenitip({ transaction, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to safely format currency
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "0";
    return amount.toLocaleString();
  };

  // Function to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    setItems([]);
    setError("");

    if (!transaction) return;

    setLoading(true);

    getDetailTransaksiByTransaksi(transaction.id_transaksi)
      .then(data => {
        console.log("Detail transaksi:", data);
        // Pastikan data adalah array
        if (data && Array.isArray(data)) {
          setItems(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Jika data berbentuk { data: [...] }
          setItems(data.data);
        } else {
          // Jika data bukan array, set items sebagai array kosong dan tampilkan error
          setItems([]);
          setError("Format data tidak valid");
          console.error("Data is not an array:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching details", err);
        setError("Gagal memuat detail transaksi");
        setLoading(false);
      });
  }, [transaction]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'lunas':
        return <Badge bg="success">Lunas</Badge>;
      case 'belum bayar':
        return <Badge bg="warning" text="dark">Belum Bayar</Badge>;
      case 'hangus':
        return <Badge bg="danger">Hangus</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  // Pastikan items adalah array sebelum menggunakan map
  const itemsArray = Array.isArray(items) ? items : [];

  return (
    <Card className="shadow-sm mb-4 border-success">
      <Card.Header as="h5" className="bg-success text-white d-flex align-items-center">
        <FaMoneyBillWave className="me-2" /> Detail Transaksi Penitipan
      </Card.Header>
      <Card.Body>
        {transaction ? (
          <>
            <Row className="mb-2">
              <Col sm={4} className="d-flex align-items-center">
                <FaCalendar className="me-2 text-success" /> <strong>Tanggal Transaksi:</strong>
              </Col>
              <Col>{formatDate(transaction.tanggal_transaksi)}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4} className="d-flex align-items-center">
                <FaMoneyBillWave className="me-2 text-success" /> <strong>Total Harga:</strong>
              </Col>
              <Col>Rp {formatCurrency(transaction.total_harga)}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4} className="d-flex align-items-center">
                <FaUser className="me-2 text-success" /> <strong>Pembeli:</strong>
              </Col>
              <Col>{transaction.pembeli?.nama_pembeli || "-"}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={4} className="d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-success" /> <strong>Status:</strong>
              </Col>
              <Col>{getStatusBadge(transaction.status_transaksi)}</Col>
            </Row>

            <h6 className="mt-4 mb-3">Barang yang Terjual:</h6>

            {loading ? (
              <div className="text-center my-3">
                <Spinner animation="border" variant="success" size="sm" />
                <p className="mt-2 small">Memuat item transaksi...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : itemsArray.length === 0 ? (
              <Alert variant="light" className="text-center my-3">
                <FaBoxOpen className="mb-2" size={24} />
                <p className="mb-0">Tidak ada item untuk transaksi ini.</p>
              </Alert>
            ) : (
              <ListGroup className="mb-4">
                {itemsArray.map((item, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{item.barang?.nama_barang || "Item tidak diketahui"}</div>
                      <div className="text-muted small">Kategori: {item.barang?.nama_kategori || "-"}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">Rp {formatCurrency(item.harga_item)}</div>
                      <div className="text-muted small">Komisi: Rp {formatCurrency(item.barang?.komisi_penitip || 0)}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            <Button variant="success" className="d-flex align-items-center" onClick={onBack}>
              <FaArrowLeft className="me-2" /> Kembali
            </Button>
          </>
        ) : (
          <Alert variant="light" className="text-center text-muted">
            Pilih transaksi untuk melihat detail.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
} 