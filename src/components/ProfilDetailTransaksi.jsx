import { useEffect, useState } from "react";
import { getDetailTransaksiByTransaksi } from "../api/DetailTransaksiApi";
import { updateBarangRating } from "../api/BarangApi";
import { getFotoBarangByIdBarang } from "../api/fotoBarangApi";
import { getByIdBarang } from "../api/PenitipanBarangApi";
import {
  Card, Button, Row, Col, ListGroup, Alert, Spinner, Modal, Badge, Image, Collapse, Toast, ToastContainer
} from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaBox, FaStar, FaRegStar, FaInfoCircle, FaChevronDown, FaChevronUp, FaImage, FaCheckCircle, FaUser } from 'react-icons/fa';

export default function ProfilDetailTransaksi({ transaction, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [thumbnails, setThumbnails] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState({ show: false, barangName: "" });
  const [penitipanData, setPenitipanData] = useState({});

  // Function to safely format currency
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "0";
    return amount.toLocaleString();
  };

  useEffect(() => {
    setItems([]);
    setError("");
    setExpandedItems({});
    setThumbnails({});
    setPenitipanData({});

    if (!transaction) return;

    setLoading(true);

    getDetailTransaksiByTransaksi(transaction.id_transaksi)
      .then(data => {
        setItems(data);
        
        // Fetch foto thumbnail untuk setiap barang
        data.forEach(item => {
          if (item.barang && item.barang.id_barang) {
            fetchThumbnail(item.barang.id_barang);
            fetchPenitipData(item.barang.id_barang);
          }
        });
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching details", err);
        setError("Gagal memuat detail transaksi");
        setLoading(false);
      });
  }, [transaction]);

  const fetchThumbnail = async (idBarang) => {
    try {
      const fotos = await getFotoBarangByIdBarang(idBarang);
      
      if (fotos && fotos.length > 0) {
        // Pilih foto dengan is_thumbnail === true
        const thumbnail = fotos.find(f => f.is_thumbnail);
        if (thumbnail) {
          setThumbnails(prev => ({
            ...prev,
            [idBarang]: thumbnail
          }));
        } else {
          // Fallback ke foto pertama (id_foto_barang terkecil)
          const sortedFotos = fotos.sort((a, b) => a.id_foto_barang - b.id_foto_barang);
          setThumbnails(prev => ({
            ...prev,
            [idBarang]: sortedFotos[0]
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching foto for barang ${idBarang}:`, error);
    }
  };

  const fetchPenitipData = async (idBarang) => {
    try {
      const penitipanResult = await getByIdBarang(idBarang);
      if (penitipanResult && penitipanResult.penitip) {
        setPenitipanData(prev => ({
          ...prev,
          [idBarang]: penitipanResult.penitip
        }));
      }
    } catch (error) {
      console.error(`Error fetching penitip data for barang ${idBarang}:`, error);
    }
  };

  const toggleItemExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

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
        
        // Tampilkan toast sukses
        setRatingSuccess({
          show: true,
          barangName: selectedBarang.nama_barang,
          rating: selectedRating
        });
        
        // Auto-hide toast after 3 seconds
        setTimeout(() => {
          setRatingSuccess(prev => ({ ...prev, show: false }));
        }, 3000);
      })
      .catch(err => {
        console.error("Gagal mengupdate rating", err);
        alert("Gagal mengupdate rating barang.");
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStarsDisplay = (barang) => {
    const ratingValue = barang?.rating || 0;
    const isRated = ratingValue > 0;

    return (
      <div 
        className={`d-flex align-items-center ${!isRated ? 'rating-action' : ''}`}
        onClick={() => {
          if (!isRated) handleOpenModal(barang);
        }}
        style={{ cursor: isRated ? "default" : "pointer" }}
      >
        {[1, 2, 3, 4, 5].map(value => (
          <span key={value} className="fs-5 me-1">
            {value <= ratingValue ? (
              <FaStar className="text-warning" />
            ) : (
              <FaRegStar className="text-warning" />
            )}
          </span>
        ))}
        {!isRated && (
          <span className="ms-2 text-muted small fst-italic">Klik untuk beri rating</span>
        )}
      </div>
    );
  };

  const getThumbnailUrl = (barangId) => {
    if (thumbnails[barangId]) {
      return `http://127.0.0.1:8000/${thumbnails[barangId].url_foto}`;
    }
    return "/assets/logoReuseMart.png"; // Default image
  };

  if (!transaction) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="text-center p-5">
          <FaInfoCircle size={50} className="text-success opacity-50 mb-3" />
          <h5>Tidak Ada Transaksi Terpilih</h5>
          <p className="text-muted">Silakan pilih transaksi untuk melihat detailnya.</p>
        </Card.Body>
      </Card>
    );
  }

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
                <Col sm={4}><strong>Tanggal:</strong></Col>
                <Col>{transaction.tanggal_transaksi}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}><strong>Total:</strong></Col>
                <Col>Rp {formatCurrency(transaction.total_harga)}</Col>
              </Row>

              <h6 className="mt-3 mb-2">Item Transaksi:</h6>

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
                        <div className="text-end">Rp {formatCurrency(item.harga_item)}</div>
      {/* Toast notification untuk sukses rating */}
      <ToastContainer 
        className="p-3" 
        position="top-end" 
        style={{ zIndex: 1060 }}
      >
        <Toast 
          show={ratingSuccess.show} 
          onClose={() => setRatingSuccess(prev => ({...prev, show: false}))}
          bg="success"
          className="text-white"
          delay={3000}
          autohide
        >
          <Toast.Header closeButton={true}>
            <FaCheckCircle className="me-2" />
            <strong className="me-auto">Rating Berhasil</strong>
          </Toast.Header>
          <Toast.Body>
            Anda telah memberikan rating {ratingSuccess.rating} bintang untuk {ratingSuccess.barangName}.
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="detail-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-success mb-0 border-bottom pb-2">Detail Transaksi #{transaction.id_transaksi}</h5>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={onBack}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-1" /> Kembali
          </Button>
        </div>

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Row className="gy-3">
              <Col md={4}>
                <div className="detail-group">
                  <div className="text-muted small mb-1">ID Transaksi</div>
                  <div className="fw-bold">{transaction.id_transaksi}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="detail-group">
                  <div className="text-muted small mb-1">Tanggal & Waktu</div>
                  <div className="fw-bold d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-success" />
                    {formatDate(transaction.tanggal_transaksi)}
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="detail-group">
                  <div className="text-muted small mb-1">Total Pembayaran</div>
                  <div className="fw-bold fs-5 text-success">
                    Rp {transaction.total_harga.toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <h6 className="mb-3">Item yang Dibeli</h6>
        
        {loading ? (
          <div className="text-center my-5 py-3">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Memuat detail transaksi...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-4">
            <FaInfoCircle className="me-2" /> {error}
          </Alert>
        ) : items.length === 0 ? (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <FaBox size={40} className="text-success opacity-50 mb-3" />
              <h5>Tidak Ada Item</h5>
              <p className="text-muted">Tidak ada item untuk transaksi ini.</p>
            </Card.Body>
          </Card>
        ) : (
          <div className="item-list">
            {items.map((item, idx) => {
              const itemId = `item-${idx}-${item.id_detail_transaksi || Math.random()}`;
              const isExpanded = !!expandedItems[itemId];
              const barangId = item.barang?.id_barang;
              const penitip = barangId ? penitipanData[barangId] : null;
              
              return (
                <Card key={itemId} className="border-0 shadow-sm mb-3">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex">
                        <div className="item-thumbnail me-3">
                          {barangId ? (
                            <Image 
                              src={getThumbnailUrl(barangId)} 
                              width={80} 
                              height={80} 
                              className="rounded shadow-sm"
                              style={{ objectFit: "cover" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/logoReuseMart.png";
                              }}
                            />
                          ) : (
                            <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ width: 80, height: 80 }}>
                              <FaImage size={24} className="text-secondary" />
                            </div>
                          )}
                        </div>
                        <div className="item-info flex-grow-1">
                          <h6 className="mb-1">{item.barang?.nama_barang || "Item tidak diketahui"}</h6>
                          <Badge bg="light" text="dark" className="mb-2">
                            1 x Rp {item.harga_item.toLocaleString()}
                          </Badge>
                          
                          {penitip && (
                            <div className="d-flex align-items-center text-muted small mb-1">
                              <FaUser className="me-1" size={12} />
                              <span>{penitip.nama_penitip}</span>
                            </div>
                          )}
                          
                          <div 
                            className="expander d-flex align-items-center text-success"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleItemExpanded(itemId)}
                          >
                            <small className="me-1">Detail</small>
                            {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </div>
                        </div>
                      </div>
                      <div className="item-price text-end">
                        <div className="text-muted small">Harga</div>
                        <div className="fw-bold text-success">Rp {item.harga_item.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <Collapse in={isExpanded}>
                      <div className="mt-3 pt-3 border-top">
                        <Row>
                          <Col md={12}>
                            <div className="mb-3">
                              <div className="text-muted small mb-1">Deskripsi</div>
                              <p className="mb-0">
                                {item.barang?.deskripsi || "Tidak ada deskripsi"}
                              </p>
                            </div>
                            <div className="mb-2">
                              <div className="text-muted small mb-1">Rating Produk</div>
                              {renderStarsDisplay(item.barang)}
                            </div>
                            {item.barang?.kategori && (
                              <div>
                                <div className="text-muted small mb-1">Kategori</div>
                                <Badge bg="success" className="me-1">
                                  {item.barang.kategori}
                                </Badge>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL UNTUK RATING */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-success">Beri Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <h5 className="mb-3">
            {selectedBarang?.nama_barang || "Barang tidak diketahui"}
          </h5>
          <div className="text-warning fs-2 mb-4">
            {[1, 2, 3, 4, 5].map(value => (
              <span
                key={value}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedRating(value)}
                className="mx-1"
              >
                {value <= selectedRating ? <FaStar /> : <FaRegStar />}
              </span>
            ))}
          </div>
          <p className="text-muted">
            {selectedRating === 0 ? "Pilih bintang untuk memberi rating" : 
             `Anda memberi rating ${selectedRating} dari 5 bintang`}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
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