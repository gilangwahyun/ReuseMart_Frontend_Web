import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Table, Row, Col, Image } from 'react-bootstrap';
import { FaTrash, FaShoppingBag, FaInfoCircle, FaImage } from 'react-icons/fa';
import { getKeranjangByIdUser } from '../../api/KeranjangApi';
import { deleteDetailKeranjang } from '../../api/DetailKeranjangApi';
import { getFotoBarangByIdBarang } from '../../api/fotoBarangApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DashboardKeranjang = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemThumbnails, setItemThumbnails] = useState({});
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.barang.harga, 0);

  useEffect(() => {
    if (!userId) {
      setError('ID User tidak ditemukan. Silakan login terlebih dahulu.');
      setLoading(false);
      return;
    }
    fetchCartData();
  }, [userId]);
  
  // Effect for fetching thumbnails when cart items change
  useEffect(() => {
    const fetchThumbnails = async () => {
      setThumbnailsLoading(true);
      const thumbnails = {};
      
      try {
        await Promise.all(
          cartItems.map(async (item) => {
            if (item.barang && item.barang.id_barang) {
              try {
                const fotos = await getFotoBarangByIdBarang(item.barang.id_barang);
                
                if (fotos && fotos.length > 0) {
                  // Prefer thumbnail image, or first image as fallback
                  const thumbnail = fotos.find(f => f.is_thumbnail) || fotos[0];
                  thumbnails[item.barang.id_barang] = thumbnail;
                }
              } catch (error) {
                console.error(`Error fetching thumbnail for item ${item.barang.id_barang}:`, error);
              }
            }
          })
        );
        
        setItemThumbnails(thumbnails);
      } catch (error) {
        console.error('Error fetching thumbnails:', error);
      } finally {
        setThumbnailsLoading(false);
      }
    };
    
    if (cartItems.length > 0) {
      fetchThumbnails();
    }
  }, [cartItems]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      console.log('Fetching cart for user:', userId);
      const cartResponse = await getKeranjangByIdUser(userId);
      console.log('Cart response:', cartResponse);
      
      if (cartResponse && cartResponse.detail_keranjang) {
        setCartItems(cartResponse.detail_keranjang);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error details:', err);
      setError('Gagal memuat data keranjang: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (detailId) => {
    try {
      await deleteDetailKeranjang(detailId);
      fetchCartData();
    } catch (err) {
      setError('Gagal menghapus barang dari keranjang');
      console.error('Error removing item:', err);
    }
  };

  const handleCheckout = () => {
    navigate('/transaksi', { 
      state: { 
        cartItems: cartItems,
        totalAmount: subtotal
      } 
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="d-flex flex-column min-vh-100">
          <Container className="py-5 flex-grow-1">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <div className="spinner-border text-success mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="mb-0">Memuat keranjang belanja Anda...</h5>
              </Card.Body>
            </Card>
          </Container>
          <Footer />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="d-flex flex-column min-vh-100">
          <Container className="py-5 flex-grow-1">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <div className="text-danger mb-3">
                  <FaShoppingBag size={60} className="opacity-50" />
                </div>
                <h4 className="mb-3 text-danger">Terjadi Kesalahan</h4>
                <p className="text-muted mb-4">{error}</p>
                <Button 
                  variant="outline-success" 
                  onClick={() => fetchCartData()}
                >
                  Coba Lagi
                </Button>
              </Card.Body>
            </Card>
          </Container>
          <Footer />
        </div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="d-flex flex-column min-vh-100">
          <Container className="py-5 flex-grow-1">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <FaShoppingBag size={60} className="text-success opacity-50 mb-4" />
                <h4 className="mb-3">Keranjang Belanja Anda Kosong</h4>
                <p className="text-muted mb-4">
                  Anda belum menambahkan barang apapun ke keranjang. Silahkan jelajahi produk kami dan temukan barang yang Anda inginkan.
                </p>
                <Button 
                  variant="success" 
                  size="lg" 
                  className="px-4"
                  onClick={() => navigate('/')}
                >
                  Mulai Belanja Sekarang
                </Button>
              </Card.Body>
            </Card>
          </Container>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="d-flex flex-column min-vh-100">
        <Container className="py-4 flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Keranjang Belanja</h2>
            <Button
              variant="outline-success"
              onClick={() => navigate('/')}
              className="d-flex align-items-center gap-2"
            >
              <FaShoppingBag size={14} />
              Lanjutkan Belanja
            </Button>
          </div>
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {thumbnailsLoading && (
                <div className="text-center my-2">
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="small text-muted mb-0 mt-1">Memuat gambar produk...</p>
                </div>
              )}
              <Table responsive hover>
                <thead>
                  <tr className="bg-light">
                    <th>No</th>
                    <th>Produk</th>
                    <th>Nama Barang</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr 
                      key={item.id_detail_keranjang}
                      className="align-middle"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${item.barang.id_barang}`)}
                    >
                      <td>{index + 1}</td>
                      <td style={{ width: '100px' }}>
                        <Link to={`/product/${item.barang.id_barang}`}>
                          {itemThumbnails[item.barang.id_barang] ? (
                            <Image 
                              src={`http://127.0.0.1:8000/${itemThumbnails[item.barang.id_barang].url_foto}`}
                              alt={item.barang.nama_barang} 
                              width={80} 
                              height={80} 
                              className="object-fit-cover border rounded"
                            />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center border rounded" style={{ width: 80, height: 80 }}>
                              <FaImage size={24} className="text-muted" />
                            </div>
                          )}
                        </Link>
                      </td>
                      <td className="fw-medium">
                        <Link 
                          to={`/product/${item.barang.id_barang}`}
                          className="text-decoration-none text-dark"
                        >
                          {item.barang.nama_barang}
                        </Link>
                      </td>
                      <td>
                        {item.barang.deskripsi.length > 50 
                          ? `${item.barang.deskripsi.substring(0, 50)}...` 
                          : item.barang.deskripsi}
                      </td>
                      <td className="fw-medium">Rp {item.barang.harga.toLocaleString()}</td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${item.barang.id_barang}`);
                            }}
                          >
                            <FaInfoCircle />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id_detail_keranjang);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-light">
                    <td colSpan="4" className="text-end fw-bold">Total:</td>
                    <td colSpan="2" className="fw-bold">Rp {subtotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </Table>

              <Row className="mt-4">
                <Col className="d-flex justify-content-end">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleCheckout}
                    className="d-flex align-items-center gap-2 py-2 px-4"
                    disabled={cartItems.length === 0}
                  >
                    <FaShoppingBag />
                    Lanjut ke Pembayaran (Rp {subtotal.toLocaleString()})
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>
    </>
  );
};

export default DashboardKeranjang;
