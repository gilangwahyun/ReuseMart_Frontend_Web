import { useEffect, useState } from "react";
import { getDetailTransaksiByTransaksi } from "../api/DetailTransaksiApi";
import { updateBarangRating } from "../api/BarangApi";
import {
  Card, Button, Row, Col, ListGroup, Alert, Spinner, Modal
} from 'react-bootstrap';

export default function ProfilDetailTransaksi({ transaction, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    setItems([]);
    setError("");

    if (!transaction) return;

    setLoading(true);

    getDetailTransaksiByTransaksi(transaction.id_transaksi)
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching details", err);
        setError("Gagal memuat detail transaksi");
        setLoading(false);
      });
  }, [transaction]);

  const handleOpenModal = (barang) => {
    if (barang.rating > 0) return; // Tidak bisa buka modal jika sudah dirating
    setSelectedBarang(barang);
    setSelectedRating(0);
    setShowModal(true);
  };

  const handleSubmitRating = () => {
    if (!selectedBarang || selectedRating === 0) return;

    updateBarangRating(selectedBarang.id_barang, { rating: selectedRating })
      .then(() => {
        setItems(prevItems =>
          prevItems.map(item =>
            item.barang.id_barang === selectedBarang.id_barang
              ? { ...item, barang: { ...item.barang, rating: selectedRating } }
              : item
          )
        );
        setShowModal(false);
      })
      .catch(err => {
        console.error("Gagal mengupdate rating", err);
        alert("Gagal mengupdate rating barang.");
      });
  };

  const renderStarsDisplay = (barang) => {
    const ratingValue = barang?.rating || 0;
    const isRated = ratingValue > 0;

    return (
      <div className="text-warning fs-4">
        {[1, 2, 3, 4, 5].map(value => (
          <span
            key={value}
            style={{ cursor: isRated ? "default" : "pointer" }}
            onClick={() => {
              if (!isRated) handleOpenModal(barang);
            }}
          >
            {value <= ratingValue ? '★' : '☆'}
          </span>
        ))}
        {!isRated && <span className="text-muted ms-2">(Klik untuk beri rating)</span>}
      </div>
    );
  };

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Header as="h5" className="bg-success text-white">
          Detail Transaksi
        </Card.Header>
        <Card.Body>
          {transaction ? (
            <>
              <Row className="mb-2">
                <Col sm={4}><strong>ID Transaksi:</strong></Col>
                <Col>{transaction.id_transaksi}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Tanggal:</strong></Col>
                <Col>{transaction.tanggal_transaksi}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}><strong>Total:</strong></Col>
                <Col>Rp {transaction.total_harga.toLocaleString()}</Col>
              </Row>

              <h6 className="mt-3 mb-2">Item Transaksi #{transaction.id_transaksi}:</h6>

              {loading ? (
                <div className="text-center my-3">
                  <Spinner animation="border" variant="success" size="sm" />
                  <p className="mt-2 small">Memuat item transaksi...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : items.length === 0 ? (
                <Alert variant="light" className="text-center my-3">
                  Tidak ada item untuk transaksi ini.
                </Alert>
              ) : (
                <ListGroup className="mb-3">
                  {items.map((item, idx) => (
                    <ListGroup.Item key={idx} className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>{item.barang?.nama_barang || "Item tidak diketahui"}</div>
                        <div className="text-end">Rp {item.harga_item.toLocaleString()}</div>
                      </div>
                      <div>{renderStarsDisplay(item.barang)}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <Button variant="success" onClick={onBack}>
                Kembali
              </Button>
            </>
          ) : (
            <Alert variant="light" className="text-center text-muted">
              Pilih transaksi untuk melihat detail.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* MODAL UNTUK RATING */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Beri Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="mb-2">
            {selectedBarang?.nama_barang || "Barang tidak diketahui"}
          </p>
          <div className="text-warning fs-3">
            {[1, 2, 3, 4, 5].map(value => (
              <span
                key={value}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedRating(value)}
              >
                {value <= selectedRating ? '★' : '☆'}
              </span>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="success" onClick={handleSubmitRating} disabled={selectedRating === 0}>
            Simpan Rating
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}