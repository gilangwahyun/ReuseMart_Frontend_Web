import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../api';
import { useReactToPrint } from 'react-to-print';

const NotaPenjualanKurir = () => {
  const { id_jadwal } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notaData, setNotaData] = useState(null);
  const printRef = useRef();
  const navigate = useNavigate();

  // Format date to DD-MM-YYYY with time
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get invoice number - format: YYM (last 2 digits of year + month)
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}-${id_jadwal}`;
  };

  useEffect(() => {
    const fetchNotaData = async () => {
      setLoading(true);
      try {
        // Step 1: Get jadwal data
        const jadwalResponse = await useAxios.get(`/jadwal/${id_jadwal}`);
        const jadwalData = jadwalResponse.data;

        // Step 2: Get transaction data
        const transaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}`);
        const transaksiData = transaksiResponse.data;

        // Step 3: Get pembeli data to get the id_user
        const pembeliResponse = await useAxios.get(`/pembeli/${transaksiData.id_pembeli}`);
        const pembeliData = pembeliResponse.data;
        
        console.log("Pembeli data:", pembeliData);
        const buyerUserId = pembeliData.id_user; // Get the buyer's user ID
        console.log("Buyer's User ID:", buyerUserId);
        
        // Step 4: Get the user email using the pembeli/user endpoint
        let buyerEmail = "Email tidak tersedia";
        if (buyerUserId) {
          try {
            // Use the endpoint that returns both pembeli and nested user data
            const pembeliUserResponse = await useAxios.get(`/pembeli/user/${buyerUserId}`);
            console.log("Pembeli user response:", pembeliUserResponse.data);
            
            // Extract email from the nested user object
            if (pembeliUserResponse.data && 
                pembeliUserResponse.data.user && 
                pembeliUserResponse.data.user.email) {
              buyerEmail = pembeliUserResponse.data.user.email;
              console.log("Found buyer email:", buyerEmail);
            }
          } catch (error) {
            console.error("Error fetching pembeli/user data:", error);
          }
        }

        // Step 5: Get courier (pegawai) data
        const pegawaiResponse = await useAxios.get(`/pegawai/${jadwalData.id_pegawai}`);
        const pegawaiData = pegawaiResponse.data;

        // Step 6: Get address data
        const alamatResponse = await useAxios.get(`/alamat/pembeli/${transaksiData.id_pembeli}`);
        const alamatData = alamatResponse.data.find(a => a.is_default) || alamatResponse.data[0];

        // Step 7: Get transaction items
        const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${transaksiData.id_transaksi}`);
        const detailTransaksiData = detailTransaksiResponse.data;

        // Step 8: Get complete item details
        const itemsWithDetails = await Promise.all(detailTransaksiData.map(async (item) => {
          try {
            const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
            const barang = barangResponse.data;
            
            return {
              ...item,
              barang: barang,
              nama_barang: barang?.nama_barang || `Barang #${item.id_barang}`,
              harga: item.harga_beli || barang?.harga || 0
            };
          } catch (error) {
            console.error(`Error fetching barang ${item.id_barang} details:`, error);
            return {
              ...item,
              nama_barang: `Barang #${item.id_barang}`,
              harga: item.harga_beli || 0
            };
          }
        }));

        // Compile all data
        setNotaData({
          invoiceNumber: generateInvoiceNumber(),
          jadwal: jadwalData,
          transaksi: transaksiData,
          pegawai: pegawaiData,
          pembeli: pembeliData,
          buyerEmail: buyerEmail,
          alamat: alamatData,
          items: itemsWithDetails
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching nota data:', error);
        setError('Gagal memuat data nota. Silakan coba lagi.');
        setLoading(false);
      }
    };

    if (id_jadwal) {
      fetchNotaData();
    } else {
      setError('ID Jadwal tidak ditemukan.');
      setLoading(false);
    }
  }, [id_jadwal]);

  // Printing functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nota_Pengiriman_${id_jadwal}`,
  });

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data nota...</p>
      </Container>
    );
  }

  if (error || !notaData) {
    return (
      <Container className="my-5">
        <Card className="shadow">
          <Card.Body className="text-center">
            <Card.Title className="text-danger">Error</Card.Title>
            <Card.Text>{error || 'Terjadi kesalahan saat memuat data.'}</Card.Text>
            <Button variant="primary" onClick={() => navigate(-1)}>Kembali</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const { invoiceNumber, jadwal, transaksi, pegawai, pembeli, buyerEmail, alamat, items } = notaData;
  const totalAmount = items.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Nota Pengiriman Kurir</h2>
        <div>
          <Button variant="primary" onClick={handlePrint} className="me-2">
            Cetak Nota
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </div>

      <Card className="shadow mb-4" ref={printRef}>
        <Card.Body className="p-4">
          <div className="mb-4 d-flex justify-content-between">
            <div>
              <div className="bg-primary text-white p-3 rounded d-inline-block">
                <h2 className="mb-0">RM</h2>
              </div>
              <h3 className="mt-2">ReuseMart</h3>
            </div>
            <div className="text-end">
              <h4>Nota Pengiriman</h4>
              <p className="mb-0"><strong>No: {invoiceNumber}</strong></p>
            </div>
          </div>

          <hr className="my-4" />

          <Row className="mb-4">
            <Col md={6}>
              <p className="mb-1"><strong>Tanggal Pesanan:</strong> {formatDate(transaksi.tanggal_transaksi)}</p>
              <p className="mb-1"><strong>Tanggal Pembayaran:</strong> {formatDate(transaksi.tanggal_transaksi)}</p>
              <p className="mb-1"><strong>Tanggal Pengiriman:</strong> {formatDate(jadwal.tanggal)}</p>
            </Col>
            <Col md={6} className="text-md-end">
              <p className="mb-1"><strong>Email Pembeli:</strong> {buyerEmail}</p>
              <p className="mb-1"><strong>Pembeli:</strong> {pembeli.nama_pembeli}</p>
              <p className="mb-1"><strong>Alamat:</strong> {alamat?.label_alamat || ''} - {alamat?.alamat_lengkap || 'Alamat tidak tersedia'}</p>
              <p className="mb-1"><strong>Kurir:</strong> {pegawai.nama_pegawai}</p>
            </Col>
          </Row>

          <Table bordered className="mt-4">
            <thead>
              <tr className="table-light">
                <th>No</th>
                <th>Nama Barang</th>
                <th className="text-center">Jumlah</th>
                <th className="text-end">Harga Satuan</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const subtotal = item.harga * (item.jumlah || 1);
                return (
                  <tr key={item.id_detail_transaksi || index}>
                    <td>{index + 1}</td>
                    <td>{item.nama_barang}</td>
                    <td className="text-center">{item.jumlah || 1}</td>
                    <td className="text-end">{formatCurrency(item.harga)}</td>
                    <td className="text-end">{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })}
              <tr className="table-light">
                <td colSpan="4" className="text-end"><strong>Total</strong></td>
                <td className="text-end"><strong>{formatCurrency(totalAmount)}</strong></td>
              </tr>
            </tbody>
          </Table>

          <Row className="mt-5">
            <Col md={4} className="text-center">
              <p className="mb-5">Gudang / Pengirim</p>
              <hr />
              <p>{pegawai.nama_pegawai}</p>
            </Col>
            <Col md={4} className="text-center">
              <p className="mb-5">Kurir</p>
              <hr />
              <p>{pegawai.nama_pegawai}</p>
            </Col>
            <Col md={4} className="text-center">
              <p className="mb-5">Penerima</p>
              <hr />
              <p>{pembeli.nama_pembeli}</p>
            </Col>
          </Row>

          <div className="mt-5 pt-5 text-center">
            <p className="mb-0 small">Terima kasih telah berbelanja di ReuseMart!</p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotaPenjualanKurir;
