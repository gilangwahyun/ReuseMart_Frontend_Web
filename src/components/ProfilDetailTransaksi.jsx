import { useEffect, useState } from "react";
import { getDetailTransaksiByTransaksi } from "../api/DetailTransaksiApi";
import { Card, Button, Row, Col, ListGroup, Alert, Spinner } from 'react-bootstrap';

export default function ProfilDetailTransaksi({ transaction, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Fetch items when transaction changes
  useEffect(() => {
    // Reset states
    setItems([]);
    setError("");
    
    if (!transaction) return;
    
    setLoading(true);
    
    // Log which transaction we're fetching details for
    console.log(`Fetching items for transaction ID: ${transaction.id_transaksi}`);
    
    getDetailTransaksiByTransaksi(transaction.id_transaksi)
      .then(data => {
        // Log the data we received
        console.log(`Received ${data.length} items for transaction ID: ${transaction.id_transaksi}`, data);
        setItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error fetching details for transaction ID: ${transaction.id_transaksi}`, error);
        setError("Gagal memuat detail transaksi");
        setLoading(false);
      });
  }, [transaction]);

  return (
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
                  <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                    <div>{item.barang?.nama_barang || "Item tidak diketahui"}</div>
                    <div className="text-end">Rp {item.harga_item.toLocaleString()}</div>
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
  );
}