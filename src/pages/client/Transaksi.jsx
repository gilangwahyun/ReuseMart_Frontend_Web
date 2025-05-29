import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Table, Row, Col, Form } from 'react-bootstrap';
import { FaArrowLeft, FaCreditCard, FaPlus, FaTruck } from 'react-icons/fa';
import { getAlamatByPembeliId } from '../../api/AlamatApi';
import { getPembeliByUserId, updatePembeli } from '../../api/PembeliApi';
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
  const [discount, setDiscount] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id_user || user?.id;

  // Constants for shipping and points calculation
  const FREE_SHIPPING_THRESHOLD = 1500000; // 1.5 juta
  const SHIPPING_COST = 100000; // 100 ribu
  const POINTS_TO_RUPIAH = 10000; // 1 poin = Rp 10.000
  const BONUS_THRESHOLD = 500000; // Threshold untuk bonus poin
  const BONUS_PERCENTAGE = 0.2; // 20% bonus poin
  const MAX_POINTS_DISCOUNT = 0.2; // Maksimal diskon 20% dari total belanja

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

  // Calculate points discount
  const calculatePointsDiscount = () => {
    if (!usePoints || !pembeli || !pembeli.jumlah_poin || pointsToUse <= 0) return 0;
    
    // Hitung diskon berdasarkan poin yang digunakan
    const pointsDiscount = pointsToUse * POINTS_TO_RUPIAH;
    
    // Batasi diskon maksimal 20% dari subtotal
    const maxDiscountAmount = subtotal * MAX_POINTS_DISCOUNT;
    
    return Math.min(pointsDiscount, maxDiscountAmount);
  };

  // Tambahkan fungsi untuk membulatkan harga
  const roundPrice = (price) => {
    // Bulatkan ke ribuan terdekat
    const remainder = price % 10000;
    if (remainder === 0) return price; // Sudah bulat ke ribuan
    
    if (remainder < 5000) {
      // Bulatkan ke bawah ke ribuan terdekat
      return Math.floor(price / 10000) * 10000;
    } else {
      // Bulatkan ke atas ke ribuan terdekat
      return Math.ceil(price / 10000) * 10000;
    }
  };

  // Update perhitungan subtotal dengan pembulatan
  const subtotal = cartItems.reduce((sum, item) => {
    const roundedPrice = roundPrice(item.barang.harga);
    return sum + roundedPrice;
  }, 0);
  
  // Calculate shipping cost
  const calculateShippingCost = () => {
    if (paymentMethod === 'Diambil Mandiri') return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };
  
  // Calculate final total with discount
  const shippingCost = calculateShippingCost();
  const pointsDiscount = calculatePointsDiscount();
  const finalTotal = subtotal + shippingCost - pointsDiscount;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Validasi data yang diperlukan
    if (!userId) {
      alert('Sesi anda telah berakhir. Silakan login kembali.');
      navigate('/login');
      return;
    }

    if (paymentMethod === 'Dikirim oleh Kurir' && !selectedAlamatId) {
      alert('Mohon pilih alamat pengiriman');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Keranjang belanja kosong');
      navigate('/keranjang');
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
        diskon: pointsDiscount,
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
      
      // Update poin pembeli jika menggunakan poin
      if (usePoints && pointsToUse > 0) {
        // Hitung poin dasar (1 poin per Rp 10.000)
        let poinDidapat = Math.floor(subtotal / POINTS_TO_RUPIAH);
        
        // Tambah bonus 20% jika total transaksi > Rp 500.000
        if (subtotal > BONUS_THRESHOLD) {
          const bonusPoin = Math.floor(poinDidapat * BONUS_PERCENTAGE);
          poinDidapat += bonusPoin;
        }
        
        // Update data pembeli dengan jumlah poin baru
        const updatedPembeliData = {
          ...pembeliData,
          jumlah_poin: pembeliData.jumlah_poin - pointsToUse + poinDidapat
        };

        await updatePembeli(pembeliData.id_pembeli, updatedPembeliData);
      }

      alert('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
      navigate('/pembayaran', { 
        state: { 
          transaksiId: transaksiResponse.data.id_transaksi,
          totalAmount: finalTotal,
          barangIds: barangIds,
          userId: userId,
          startTime: new Date().toISOString()
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
                      <td>Rp {roundPrice(item.barang.harga).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end">Subtotal:</td>
                    <td>Rp {subtotal.toLocaleString()}</td>
                  </tr>
                  {pointsDiscount > 0 && (
                    <tr>
                      <td colSpan="3" className="text-end text-success">
                        Diskon Poin ({pembeli?.jumlah_poin || 0} poin):
                      </td>
                      <td className="text-success">
                        - Rp {pointsDiscount.toLocaleString()}
                      </td>
                    </tr>
                  )}
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
                    </>
                  )}
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Total Keseluruhan:</td>
                    <td className="fw-bold">Rp {finalTotal.toLocaleString()}</td>
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

                {/* Add Points Usage Section */}
                {pembeli && pembeli.jumlah_poin > 0 && (
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      label="Gunakan poin untuk diskon"
                      checked={usePoints}
                      onChange={(e) => {
                        setUsePoints(e.target.checked);
                        if (!e.target.checked) setPointsToUse(0);
                      }}
                    />
                    {usePoints && (
                      <>
                        <Form.Label className="mt-2">Jumlah Poin yang Digunakan</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max={pembeli.jumlah_poin}
                          value={pointsToUse}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setPointsToUse(Math.min(value, pembeli.jumlah_poin));
                          }}
                          placeholder={`Maksimal ${pembeli.jumlah_poin} poin`}
                        />
                        <Form.Text className="text-muted">
                          <div>Poin tersedia: {pembeli.jumlah_poin} poin</div>
                          <div>1 poin = Rp {POINTS_TO_RUPIAH.toLocaleString()}</div>
                          <div>Maksimal diskon 20% dari total belanja</div>
                          {pointsToUse > 0 && (
                            <div className="text-success">
                              Diskon yang didapat: Rp {(pointsToUse * POINTS_TO_RUPIAH).toLocaleString()}
                            </div>
                          )}
                        </Form.Text>
                      </>
                    )}
                  </Form.Group>
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