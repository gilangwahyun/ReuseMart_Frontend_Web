import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Row, Col, Form } from 'react-bootstrap';
import { FaArrowLeft, FaCreditCard, FaPlus, FaTruck } from 'react-icons/fa';
import { getAlamatByPembeliId } from '../../api/AlamatApi';
import { getPembeliByUserId } from '../../api/PembeliApi';
import { createTransaksi, createDetailTransaksi } from '../../api/TransaksiApi';

const Transaksi = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Dikirim oleh Kurir');
  const [selectedAlamatId, setSelectedAlamatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [alamatList, setAlamatList] = useState([]);
  const [pembeli, setPembeli] = useState(null);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id_user || user?.id;

  // Constants for shipping calculation
  const FREE_SHIPPING_THRESHOLD = 1500000; // 1.5 juta
  const SHIPPING_COST = 100000; // 100 ribu

  useEffect(() => {
    // Get cart data from navigation state
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      setTotalAmount(location.state.totalAmount);
    } else {
      navigate('/keranjang');
    }

    // Fetch pembeli and alamat data
    const fetchPembeliAndAlamat = async () => {
      try {
        const pembeliData = await getPembeliByUserId(userId);
        setPembeli(pembeliData);
        
        if (pembeliData) {
          const alamatData = await getAlamatByPembeliId(pembeliData.id_pembeli);
          setAlamatList(alamatData || []);
        }
      } catch (error) {
        console.error('Error fetching pembeli and alamat:', error);
      }
    };

    fetchPembeliAndAlamat();
  }, [location.state, navigate, userId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddressChange = (e) => {
    setSelectedAlamatId(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    // Reset alamat selection and set id_alamat to null when Diambil Mandiri is selected
    if (method === 'Diambil Mandiri') {
      setSelectedAlamatId(null);
    } else {
      setSelectedAlamatId('');
    }
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.barang.harga, 0);
  
  // Calculate shipping cost
  const calculateShippingCost = () => {
    if (paymentMethod === 'Diambil Mandiri') return 0;
    // Untuk Diambil oleh Kurir, hitung ongkir berdasarkan total belanja
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };
  
  // Calculate final total
  const shippingCost = calculateShippingCost();
  const finalTotal = subtotal + shippingCost;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'Dikirim oleh Kurir' && !selectedAlamatId) {
      alert('Mohon pilih alamat pengiriman');
      return;
    }

    setLoading(true);
    
    try {
      // Get pembeli data
      const pembeliData = await getPembeliByUserId(userId);
      if (!pembeliData) {
        throw new Error('Data pembeli tidak ditemukan');
      }

      // Get barang IDs from cart items
      const barangIds = cartItems.map(item => item.barang.id_barang);

      // Create transaction
      const transaksiData = {
        id_pembeli: pembeliData.id_pembeli,
        id_alamat: paymentMethod === 'Dikirim oleh Kurir' ? parseInt(selectedAlamatId) : null,
        total_harga: finalTotal,
        status_transaksi: 'Belum Dibayar',
        metode_pengiriman: paymentMethod,
        tanggal_transaksi: new Date().toISOString().split('T')[0]
      };

      const transaksiResponse = await createTransaksi(transaksiData);
      
      if (!transaksiResponse.data) {
        throw new Error('Gagal membuat transaksi');
      }

      // Create detail transactions for each item
      const detailPromises = cartItems.map(item => 
        createDetailTransaksi({
          id_barang: item.barang.id_barang,
          id_transaksi: transaksiResponse.data.id_transaksi,
          harga_item: item.barang.harga
        })
      );

      await Promise.all(detailPromises);
      
      alert('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
      navigate('/pembayaran', { 
        state: { 
          transaksiId: transaksiResponse.data.id_transaksi,
          totalAmount: finalTotal,
          barangIds: barangIds  // Pass barang IDs to payment page
        }
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Gagal membuat pesanan: ' + (error.response?.data?.message || error.message));
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
                    <td colSpan="3" className="text-end">Subtotal:</td>
                    <td>Rp {subtotal.toLocaleString()}</td>
                  </tr>
                  {paymentMethod === 'Dikirim oleh Kurir' && (
                    <>
                      <tr>
                        <td colSpan="3" className="text-end">
                          Biaya Pengiriman:
                          {subtotal >= FREE_SHIPPING_THRESHOLD && (
                            <span className="text-success ms-2">
                              <small>(Gratis untuk pembelian di atas Rp 1.500.000)</small>
                            </span>
                          )}
                        </td>
                        <td>
                          {shippingCost === 0 ? (
                            <span className="text-success">Gratis</span>
                          ) : (
                            `Rp ${shippingCost.toLocaleString()}`
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">Total Keseluruhan:</td>
                        <td className="fw-bold">Rp {finalTotal.toLocaleString()}</td>
                      </tr>
                    </>
                  )}
                  {paymentMethod === 'Diambil Mandiri' && (
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">Total Keseluruhan:</td>
                      <td className="fw-bold">Rp {subtotal.toLocaleString()}</td>
                    </tr>
                  )}
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
                  <Form.Label>Metode Pengambilan</Form.Label>
                  <Form.Select 
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <option value="Dikirim oleh Kurir">Dikirim oleh Kurir</option>
                    <option value="Diambil Mandiri">Diambil Mandiri</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    {paymentMethod === 'Diambil Mandiri' ? 'Alamat Pengambilan' : 'Pilih Alamat Pengiriman'}
                  </Form.Label>
                  {paymentMethod === 'Diambil Mandiri' ? (
                    <div className="p-3 bg-light rounded">
                      <p className="mb-0">
                        <strong>Alamat Toko:</strong><br />
                        Jl. ReuseMart No. 123<br />
                        Buka: Senin - Minggu, 09:00 - 21:00 WIB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Form.Select 
                        value={selectedAlamatId}
                        onChange={handleAddressChange}
                        className="mb-2"
                        required
                      >
                        <option value="">Pilih alamat...</option>
                        {alamatList.map((alamat) => (
                          <option key={alamat.id_alamat} value={alamat.id_alamat}>
                            {alamat.label_alamat}
                          </option>
                        ))}
                      </Form.Select>

                      {selectedAlamatId && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Alamat yang dipilih: {alamatList.find(addr => addr.id_alamat === parseInt(selectedAlamatId))?.alamat_lengkap}
                          </small>
                        </div>
                      )}
                    </>
                  )}
                </Form.Group>

                {paymentMethod === 'Dikirim oleh Kurir' && (
                  <div className="alert alert-info mb-3">
                    <FaTruck className="me-2" />
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                      <span>Selamat! Anda mendapatkan pengiriman gratis untuk pembelian di atas Rp 1.500.000</span>
                    ) : (
                      <span>
                        Tambahkan belanja Rp {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} lagi untuk mendapatkan pengiriman gratis!
                      </span>
                    )}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading || (paymentMethod === 'Dikirim oleh Kurir' && !selectedAlamatId)}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaCreditCard />
                    {loading ? 'Memproses...' : `Buat Pesanan (Rp ${finalTotal.toLocaleString()})`}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleBack}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaArrowLeft />
                    Kembali ke Keranjang
                  </Button>
                  {paymentMethod === 'Dikirim oleh Kurir' && (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => navigate('/DashboardProfilPembeli')}
                      className="d-flex align-items-center justify-content-center gap-2"
                    >
                      <FaPlus />
                      Kelola Alamat
                    </Button>
                  )}
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