import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Button, Table, Row, Col } from 'react-bootstrap';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { getKeranjangByIdUser } from '../../api/KeranjangApi';
import { deleteDetailKeranjang } from '../../api/DetailKeranjangApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DashboardKeranjang = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        <Container className="py-4">
          <h5 className="text-center">Memuat keranjang...</h5>
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container className="py-4">
          <h5 className="text-center text-danger">{error}</h5>
        </Container>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <Container className="py-4">
          <h5 className="text-center">Keranjang belanja kosong</h5>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <h2 className="mb-4">Keranjang Belanja</h2>
        
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Barang</th>
                  <th>Deskripsi</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={item.id_detail_keranjang}>
                    <td>{index + 1}</td>
                    <td>{item.barang.nama_barang}</td>
                    <td>{item.barang.deskripsi}</td>
                    <td>Rp {item.barang.harga.toLocaleString()}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id_detail_keranjang)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td colSpan="2" className="fw-bold">Rp {subtotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </Table>

            <Row className="mt-4">
              <Col className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  className="d-flex align-items-center gap-2"
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
    </>
  );
};

export default DashboardKeranjang;
