import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Alert, Form } from 'react-bootstrap';
import { FaArrowLeft, FaCopy, FaClock, FaCreditCard, FaUpload } from 'react-icons/fa';
import { updateStatusTransaksi } from '../../api/TransaksiApi';
import { createPembayaran } from '../../api/PembayaranApi';
import { updateBarang } from '../../api/BarangApi';
import { getDetailTransaksiByTransaksi } from '../../api/DetailTransaksiApi';
import { deleteDetailKeranjangByUser } from '../../api/DetailKeranjangApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Pembayaran = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(() => {
    // Get initial time from localStorage or set to 60
    const savedTime = localStorage.getItem(`countdown_${location.state?.transaksiId}`);
    const savedStartTime = localStorage.getItem(`startTime_${location.state?.transaksiId}`);
    
    if (savedTime && savedStartTime) {
      const elapsed = Math.floor((new Date().getTime() - new Date(savedStartTime).getTime()) / 1000);
      return Math.max(60 - elapsed, 0);
    }
    return 60;
  });
  const [virtualAccount, setVirtualAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const [buktiTransfer, setBuktiTransfer] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Belum Diverifikasi'); // 'pending', 'expired', 'processing'
  
  // Get transaction data from navigation state
  const { transaksiId, totalAmount, barangIds } = location.state || {};

  useEffect(() => {
    // Generate random virtual account number when component mounts
    generateVirtualAccount();

    // Save start time in localStorage if not exists
    if (!localStorage.getItem(`startTime_${transaksiId}`)) {
      localStorage.setItem(`startTime_${transaksiId}`, new Date().toISOString());
    }

    // Set up countdown timer
    const timer = setInterval(async () => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        // Save current time in localStorage
        localStorage.setItem(`countdown_${transaksiId}`, newTime.toString());
        
        if (newTime <= 0) {
          clearInterval(timer);
          // Update transaction status to expired when timer expires
          const updateTransactionStatus = async () => {
            try {
              await updateStatusTransaksi(transaksiId, 'Hangus');
              setPaymentStatus('Belum Diverifikasi');
              // Clear localStorage when expired
              localStorage.removeItem(`countdown_${transaksiId}`);
              localStorage.removeItem(`startTime_${transaksiId}`);
              
              // Show alert and navigate to homepage
              alert('Waktu pembayaran telah habis. Transaksi dibatalkan.');
              navigate('/');
            } catch (error) {
              console.error('Error updating transaction status:', error);
              setPaymentStatus('Belum Diverifikasi');
              // Still navigate to homepage even if there's an error
              navigate('/');
            }
          };
          updateTransactionStatus();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => {
      clearInterval(timer);
    };
  }, [transaksiId, navigate]);

  const generateVirtualAccount = () => {
    // Generate a random 16-digit number
    const randomNum = Math.floor(Math.random() * 10000000000000000)
      .toString()
      .padStart(16, '0');
    setVirtualAccount(randomNum);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(virtualAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmitPayment = async () => {
    if (!buktiTransfer) {
      alert('Mohon upload bukti transfer terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      // Check if transaction is already expired
      const savedStartTime = localStorage.getItem(`startTime_${transaksiId}`);
      const currentTime = new Date().getTime();
      const startTime = new Date(savedStartTime).getTime();
      const timeElapsed = (currentTime - startTime) / 1000;

      if (timeElapsed > 60) {
        await updateStatusTransaksi(transaksiId, 'Hangus');
        setPaymentStatus('Belum Diverifikasi');
        // Clear localStorage
        localStorage.removeItem(`countdown_${transaksiId}`);
        localStorage.removeItem(`startTime_${transaksiId}`);
        alert('Waktu pembayaran telah habis. Transaksi dibatalkan.');
        return;
      }

      // Buat FormData untuk upload file
      const formData = new FormData();
      formData.append('id_transaksi', transaksiId);
      formData.append('harga_barang', totalAmount);
      formData.append('tanggal_pembayaran', new Date().toISOString().replace('T', ' ').substring(0, 19)); // Format: 'YYYY-MM-DD HH:MM:SS'
      formData.append('bukti_transfer', buktiTransfer);
      formData.append('status_verifikasi', 'Belum Diverifikasi');

      // Update status transaksi
      await updateStatusTransaksi(transaksiId, 'Lunas');
      
      // Upload pembayaran dengan file
      await createPembayaran(formData);

      // Update status semua barang menjadi Habis
      if (barangIds && barangIds.length > 0) {
        const updatePromises = barangIds.map(id => 
          updateBarang(id, { status_barang: 'Habis' })
        );
        await Promise.all(updatePromises);
      }

      // Delete cart items for the user
      if (location.state?.userId) {
        await deleteDetailKeranjangByUser(location.state.userId);
      }

      // Tampilkan notifikasi sukses
      alert('Pembayaran berhasil dikirim! Silakan tunggu verifikasi dari admin.');
      
      // Kembali ke home
      navigate('/');
      
      // Clear localStorage after successful payment
      localStorage.removeItem(`countdown_${transaksiId}`);
      localStorage.removeItem(`startTime_${transaksiId}`);

    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Gagal mengirim pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.match('image.*')) {
        alert('File harus berupa gambar (JPG, PNG)');
        return;
      }
      
      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      setBuktiTransfer(file); // Simpan file object
    }
  };

  if (!transaksiId || !totalAmount || !barangIds) {
    return (
      <>
        <Navbar />
        <Container className="py-4">
          <Alert variant="danger">
            Data transaksi tidak lengkap. Silakan kembali ke halaman keranjang.
          </Alert>
          <Button variant="primary" onClick={handleBack}>
            <FaArrowLeft className="me-2" />
            Kembali
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <>
        <Navbar />
        <Container className="py-4">
          <Card className="mb-4">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">Pembayaran Kadaluarsa</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                <h6>Waktu pembayaran telah habis</h6>
                <p className="mb-0">
                  Transaksi ini telah dibatalkan karena waktu pembayaran telah habis.
                  Silakan buat transaksi baru untuk melanjutkan pembelian.
                </p>
              </Alert>
              <Button variant="primary" onClick={handleBack}>
                <FaArrowLeft className="me-2" />
                Kembali ke Keranjang
              </Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <>
        <Navbar />
        <Container className="py-4">
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Pembayaran Sedang Diproses</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <h6>Pembayaran Anda sedang diverifikasi</h6>
                <p className="mb-0">
                  Terima kasih telah melakukan pembayaran. Bukti pembayaran Anda sedang diverifikasi oleh tim kami.
                  Anda akan menerima notifikasi setelah pembayaran diverifikasi.
                </p>
              </Alert>
              <Button variant="primary" onClick={handleBack}>
                <FaArrowLeft className="me-2" />
                Kembali ke Beranda
              </Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <h2 className="mb-4">Pembayaran</h2>
        
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaClock className="me-2" />
                  Selesaikan Pembayaran dalam {formatTime(timeLeft)}
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning" className="mb-4">
                  <h6 className="mb-2">Penting!</h6>
                  <p className="mb-0">
                    Silakan selesaikan pembayaran sebelum waktu habis. 
                    Jika waktu habis, pesanan akan dibatalkan secara otomatis.
                  </p>
                </Alert>

                <div className="mb-4">
                  <h6>Detail Pembayaran:</h6>
                  <p className="mb-1">ID Transaksi: {transaksiId}</p>
                  <p className="mb-1">Total Pembayaran: Rp {totalAmount.toLocaleString()}</p>
                </div>

                <div className="mb-4">
                  <h6>Virtual Account:</h6>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <code className="fs-4">{virtualAccount}</code>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleCopyVA}
                      className="d-flex align-items-center gap-1"
                    >
                      <FaCopy />
                      {copied ? 'Tersalin!' : 'Salin'}
                    </Button>
                  </div>
                  <small className="text-muted">
                    Gunakan nomor Virtual Account di atas untuk melakukan pembayaran melalui ATM, 
                    Mobile Banking, atau Internet Banking bank manapun.
                  </small>
                </div>

                <div className="mb-4">
                  <h6>Upload Bukti Transfer:</h6>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Control 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Upload bukti transfer pembayaran Anda (format: JPG, PNG)
                    </Form.Text>
                  </Form.Group>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    onClick={handleSubmitPayment}
                    disabled={loading || !buktiTransfer}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      'Memproses...'
                    ) : (
                      <>
                        <FaUpload />
                        Kirim Bukti Pembayaran
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleBack}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaArrowLeft />
                    Kembali
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Pembayaran;
