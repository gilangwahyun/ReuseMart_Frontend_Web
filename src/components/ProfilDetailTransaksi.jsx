import { useEffect, useState } from "react";
import { getDetailTransaksiByTransaksi } from "../api/DetailTransaksiApi";
import { updateBarangRating } from "../api/BarangApi";
import { getFotoBarangByIdBarang } from "../api/fotoBarangApi";
import { getByIdBarang } from "../api/PenitipanBarangApi";
import {
  Card, Button, Row, Col, ListGroup, Alert, Spinner, Modal, Badge, Image, Collapse
} from 'react-bootstrap';
import {
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaRegStar,
  FaInfoCircle, FaUser, FaTruck, FaHandsHelping, FaCheck
} from 'react-icons/fa';

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
      .then(response => {
        // Periksa bentuk data yang dikembalikan
        const dataArray = Array.isArray(response) ? response : 
                         (response && response.data ? response.data : []);
        
        setItems(dataArray);
        
        // Fetch foto thumbnail untuk setiap barang
        dataArray.forEach(item => {
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
    if (transaction?.status_transaksi?.toLowerCase() !== 'selesai') return; // Hanya boleh rating jika transaksi selesai
    
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
    const canRate = transaction?.status_transaksi?.toLowerCase() === 'selesai';

    return (
      <div 
        className={`d-flex align-items-center ${!isRated && canRate ? 'rating-action' : ''}`}
        onClick={() => {
          if (!isRated && canRate) handleOpenModal(barang);
        }}
        style={{ cursor: !isRated && canRate ? "pointer" : "default" }}
      >
        {[1, 2, 3, 4, 5].map(value => (
          <span key={value} className="me-1">
            {value <= ratingValue ? (
              <FaStar className="text-warning" />
            ) : (
              <FaRegStar className="text-warning" />
            )}
          </span>
        ))}
        {!isRated && canRate ? (
          <span className="ms-2 text-muted small fst-italic">Klik untuk beri rating</span>
        ) : !isRated && !canRate ? (
          <span className="ms-2 text-muted small fst-italic">Rating tersedia setelah transaksi selesai</span>
        ) : null}
      </div>
    );
  };

  const getThumbnailUrl = (barangId) => {
    if (thumbnails[barangId]) {
      return `http://127.0.0.1:8000/${thumbnails[barangId].url_foto}`;
    }
    return "/assets/logoReuseMart.png"; // Default image
  };

  // Get shipping method icon
  const getShippingMethodIcon = (method) => {
    if (!method) return null;
    
    if (method.toLowerCase() === 'dikirim oleh kurir') {
      return <FaTruck className="text-primary" />;
    } else if (method.toLowerCase() === 'diambil mandiri') {
      return <FaHandsHelping className="text-secondary" />;
    }
    
    return null;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'proses':
        return 'primary';
      case 'lunas':
        return 'success';
      case 'dibatalkan':
        return 'danger';
      case 'selesai':
        return 'success';
      case 'pending':
        return 'secondary';
      case 'belum dibayar':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (!transaction) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center p-5">
          <FaInfoCircle size={40} className="text-secondary opacity-50 mb-3" />
          <h5 className="fw-medium">Tidak Ada Transaksi Terpilih</h5>
          <p className="text-muted">Silakan pilih transaksi untuk melihat detailnya.</p>
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            Kembali
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="detail-transaction-container">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onBack}
              className="me-3 d-flex align-items-center justify-content-center"
              style={{width: '38px', height: '38px', borderRadius: '50%'}}
            >
              <FaArrowLeft />
            </Button>
            <h5 className="mb-0 fw-semibold">Detail Transaksi #{transaction.id_transaksi}</h5>
          </div>
          {transaction.status_transaksi && (
            <Badge 
              bg={getStatusBadgeColor(transaction.status_transaksi)} 
              className="ms-2 px-3 py-2"
            >
              {transaction.status_transaksi}
            </Badge>
          )}
        </Card.Header>
        
        <Card.Body className="p-4">
          <Row className="mb-4 g-3">
            <Col md={4}>
              <div className="detail-group">
                <div className="text-muted small mb-1">Tanggal Transaksi</div>
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="me-2 text-primary" />
                  <span className="fw-medium">{formatDate(transaction.tanggal_transaksi)}</span>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="detail-group">
                <div className="text-muted small mb-1">Metode Pengiriman</div>
                <div className="d-flex align-items-center">
                  {getShippingMethodIcon(transaction.metode_pengiriman)}
                  <span className="fw-medium ms-2">
                    {transaction.metode_pengiriman || "Tidak tersedia"}
                  </span>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="detail-group">
                <div className="text-muted small mb-1">Total Pembayaran</div>
                <div className="fw-bold fs-5 text-primary">
                  Rp {formatCurrency(transaction.total_harga)}
                </div>
              </div>
            </Col>
          </Row>
          
          <hr className="my-4" />
          
          <h6 className="mb-3 fw-semibold">Item yang Dibeli</h6>
          
          {loading ? (
            <div className="text-center my-5 py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat detail transaksi...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mb-4">
              <FaInfoCircle className="me-2" /> {error}
            </Alert>
          ) : items.length === 0 ? (
            <Alert variant="light" className="text-center mb-4 border">
              <FaInfoCircle size={30} className="text-secondary opacity-50 mb-3" />
              <p className="mb-0">Tidak ada item untuk transaksi ini.</p>
            </Alert>
          ) : (
            <ListGroup variant="flush">
              {items.map((item, idx) => {
                const itemId = `item-${idx}-${item.id_detail_transaksi || Math.random()}`;
                const isExpanded = !!expandedItems[itemId];
                const barangId = item.barang?.id_barang;
                const penitip = barangId ? penitipanData[barangId] : null;
                
                return (
                  <ListGroup.Item key={itemId} className="py-3 px-0 border-top-0 border-start-0 border-end-0">
                    <div className="d-flex">
                      <div className="item-thumbnail me-3">
                        <Image 
                          src={getThumbnailUrl(barangId)} 
                          width={80} 
                          height={80} 
                          className="rounded border"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/logoReuseMart.png";
                          }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1 fw-medium">{item.barang?.nama_barang || "Item tidak diketahui"}</h6>
                            <div className="mb-2">
                              <Badge bg="light" text="dark" className="border me-2">
                                1 x Rp {formatCurrency(item.harga_item)}
                              </Badge>
                              {item.barang?.kategori && (
                                <Badge bg="light" text="dark" className="border">
                                  {typeof item.barang.kategori === 'object' ? item.barang.kategori.nama_kategori : item.barang.kategori}
                                </Badge>
                              )}
                            </div>
                            {penitip && (
                              <div className="d-flex align-items-center text-muted small">
                                <FaUser className="me-1" size={10} />
                                <span>Penitip: {penitip.nama_penitip}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-end">
                            <div className="fw-medium mb-1">Rp {formatCurrency(item.harga_item)}</div>
                            <Button 
                              variant="link" 
                              className="p-0 text-decoration-none small"
                              onClick={() => toggleItemExpanded(itemId)}
                            >
                              {isExpanded ? 'Sembunyikan detail' : 'Lihat detail'}
                            </Button>
                          </div>
                        </div>
                        
                        <Collapse in={isExpanded}>
                          <div>
                            <div className="bg-light p-3 rounded mt-2">
                              <Row>
                                <Col md={12} className="mb-3">
                                  <div className="text-muted small mb-1">Deskripsi</div>
                                  <p className="mb-0">
                                    {item.barang?.deskripsi || "Tidak ada deskripsi"}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="text-muted small mb-1">Rating Produk</div>
                                  {renderStarsDisplay(item.barang)}
                                </Col>
                              </Row>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Modal untuk rating */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Beri Rating</Modal.Title>
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
          <Button variant="primary" onClick={handleSubmitRating} disabled={selectedRating === 0}>
            Simpan Rating
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Toast notification diganti dengan alert yang muncul/hilang */}
      {ratingSuccess.show && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 10 }}>
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <FaCheck className="me-2" />
            <div>
              Rating berhasil disimpan untuk {ratingSuccess.barangName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}