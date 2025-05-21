import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Row, Col, Form } from 'react-bootstrap';
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa';

const Transaksi = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get cart data from navigation state
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      setTotalAmount(location.state.totalAmount);
    } else {
      // If no cart data, redirect back to cart
      navigate('/keranjang');
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement order submission logic here
      // This will be implemented when we have the backend API ready
      console.log('Submitting order with:', {
        items: cartItems,
        totalAmount,
        paymentMethod,
        shippingAddress
      });
      
      // For now, just show success message
      alert('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <Container className="py-4">
        <h5 className="text-center">Tidak ada item dalam keranjang</h5>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={handleBack}>
            <FaArrowLeft className="me-2" />
            Kembali ke Keranjang
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      
      <Row>
        {/* Order Summary */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Ringkasan Pesanan</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Barang</th>
                    <th>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={item.id_detail_keranjang}>
                      <td>{index + 1}</td>
                      <td>{item.barang.nama_barang}</td>
                      <td>Rp {item.barang.harga.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="text-end fw-bold">Total:</td>
                    <td className="fw-bold">Rp {totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Payment Details */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Detail Pembayaran</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitOrder}>
                <Form.Group className="mb-3">
                  <Form.Label>Metode Pembayaran</Form.Label>
                  <Form.Select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="transfer">Transfer Bank</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cod">Cash on Delivery</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Alamat Pengiriman</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap pengiriman"
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaCreditCard />
                    {loading ? 'Memproses...' : 'Buat Pesanan'}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleBack}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaArrowLeft />
                    Kembali ke Keranjang
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Transaksi; 