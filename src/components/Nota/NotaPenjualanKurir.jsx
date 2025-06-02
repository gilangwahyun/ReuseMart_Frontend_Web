import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../api';
import { useReactToPrint } from 'react-to-print';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Define PDF styles
const stylesPdf = StyleSheet.create({
  page: { 
    fontFamily: 'Helvetica', 
    fontSize: 11, 
    padding: 20, 
    lineHeight: 1.5 
  },
  header: { 
    textAlign: 'center',
    marginBottom: 10
  },
  storeName: { 
    fontSize: 14,
    fontWeight: 'bold'
  },
  storeAddress: {
    fontSize: 10,
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  col: {
    flexDirection: 'column'
  },
  label: {
    width: 80,
    fontSize: 10
  },
  value: {
    flex: 1,
    fontSize: 10
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dotted',
    marginVertical: 5
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10
  },
  itemName: {
    flex: 1
  },
  itemPrice: {
    width: 80,
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 3,
    fontSize: 10
  },
  signature: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  signatureBox: {
    width: 150,
    alignItems: 'center'
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: '#000000',
    width: 120,
    marginTop: 40,
    marginBottom: 5
  }
});

// PDF Document Component
const NotaPengirimanDocument = ({ data }) => {
  const { invoiceNumber, jadwal, transaksi, pegawai, pembeli, buyerEmail, alamat, items, qcOfficer } = data;
  
  // Format date for PDF
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // Calculate total
  const totalAmount = items.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);
  
  // Format address
  const formattedAddress = alamat ? 
    [
      alamat.alamat_lengkap
    ].filter(part => part && part.trim() !== '').join(', ') : 
    'Alamat tidak tersedia';
  
  return (
    <Document>
      <Page size="A5" style={stylesPdf.page}>
        {/* Header */}
        <View style={stylesPdf.header}>
          <Text style={stylesPdf.storeName}>ReUse Mart</Text>
          <Text style={stylesPdf.storeAddress}>Jl. Green Eco Park No. 456 Yogyakarta</Text>
        </View>
        
        {/* Invoice Details */}
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>No Nota</Text>
          <Text style={stylesPdf.value}>: {invoiceNumber}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Tanggal pesan</Text>
          <Text style={stylesPdf.value}>: {formatDate(transaksi.tanggal_transaksi)}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Lunas pada</Text>
          <Text style={stylesPdf.value}>: {formatDate(transaksi.tanggal_transaksi)}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Tanggal ambil</Text>
          <Text style={stylesPdf.value}>: {formatDate(jadwal.tanggal)}</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* Customer Details */}
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Pembeli</Text>
          <Text style={stylesPdf.value}>: {buyerEmail} / {pembeli.nama_pembeli}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Alamat</Text>
          <Text style={stylesPdf.value}>: {formattedAddress}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Delivery</Text>
          <Text style={stylesPdf.value}>: Kurir ReUseMart ({pegawai?.nama_pegawai || 'Tidak tersedia'})</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* Items */}
        {items.map((item, index) => {
          const subtotal = item.harga * (item.jumlah || 1);
          return (
            <View style={stylesPdf.itemRow} key={index}>
              <Text style={stylesPdf.itemName}>{item.nama_barang}</Text>
              <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(subtotal)}</Text>
            </View>
          );
        })}
        
        <View style={stylesPdf.divider} />
        
        {/* Totals */}
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Total</Text>
          <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(totalAmount)}</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Ongkos Kirim</Text>
          <Text style={stylesPdf.itemPrice}>0</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Total</Text>
          <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(totalAmount)}</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* QC Officer */}
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>QC oleh: {qcOfficer}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Diambil oleh:</Text>
        </View>
        
        {/* Signature */}
        <View style={stylesPdf.signature}>
          <View style={stylesPdf.signatureBox}>
            <Text style={stylesPdf.signatureLine}></Text>
            <Text style={{fontSize: 10}}>Tanggal: ...............................</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const NotaPenjualanKurir = () => {
  const { id_jadwal } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notaData, setNotaData] = useState(null);
  const printRef = useRef();
  const navigate = useNavigate();

  // Format date to DD/MM/YYYY with time
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get invoice number - format: YY.MM.XXX
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}.${month}.101`;
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
        
        console.log("Pegawai data fetched:", pegawaiData);
        console.log("Jadwal data id_pegawai:", jadwalData.id_pegawai);
        
        // If pegawaiData is empty or doesn't have nama_pegawai, try to get it from jadwal.pegawai
        if (!pegawaiData || !pegawaiData.nama_pegawai) {
          console.log("Attempting to fetch complete jadwal data with populated pegawai");
          try {
            const fullJadwalResponse = await useAxios.get(`/jadwal/${id_jadwal}?populate=pegawai`);
            const fullJadwalData = fullJadwalResponse.data;
            console.log("Full jadwal data:", fullJadwalData);
            
            if (fullJadwalData.pegawai && fullJadwalData.pegawai.nama_pegawai) {
              console.log("Found pegawai name in jadwal data:", fullJadwalData.pegawai.nama_pegawai);
              pegawaiData.nama_pegawai = fullJadwalData.pegawai.nama_pegawai;
            }
          } catch (err) {
            console.error("Error fetching full jadwal data:", err);
          }
        }

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
            
            // Fetch penitipan data to get nama_petugas_qc
            let namaPetugasQC = "Tidak tersedia";
            try {
              const penitipanResponse = await useAxios.get(`/penitipanBarang/barang/${item.id_barang}`);
              if (penitipanResponse.data && penitipanResponse.data.nama_petugas_qc) {
                namaPetugasQC = penitipanResponse.data.nama_petugas_qc;
              }
            } catch (penitipanError) {
              console.error(`Error fetching penitipan for barang ${item.id_barang}:`, penitipanError);
            }
            
            return {
              ...item,
              barang: barang,
              nama_barang: barang?.nama_barang || `Barang #${item.id_barang}`,
              harga: item.harga_beli || barang?.harga || 0,
              nama_petugas_qc: namaPetugasQC
            };
          } catch (error) {
            console.error(`Error fetching barang ${item.id_barang} details:`, error);
            return {
              ...item,
              nama_barang: `Barang #${item.id_barang}`,
              harga: item.harga_beli || 0,
              nama_petugas_qc: "Tidak tersedia"
            };
          }
        }));

        // Fetch QC officer name for display at the top level
        let qcOfficer = "Tidak tersedia";
        if (itemsWithDetails.length > 0 && itemsWithDetails[0].nama_petugas_qc) {
          qcOfficer = itemsWithDetails[0].nama_petugas_qc;
        }

        // Compile all data
        setNotaData({
          invoiceNumber: generateInvoiceNumber(),
          jadwal: jadwalData,
          transaksi: transaksiData,
          pegawai: pegawaiData,
          pembeli: pembeliData,
          buyerEmail: buyerEmail,
          alamat: alamatData,
          items: itemsWithDetails,
          qcOfficer: qcOfficer
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

  const { invoiceNumber, jadwal, transaksi, pegawai, pembeli, buyerEmail, alamat, items, qcOfficer } = notaData;
  const totalAmount = items.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);

  // Format address for display
  const formattedAddress = alamat ? 
    [
      alamat.alamat_lengkap
    ].filter(part => part && part.trim() !== '').join(', ') : 
    'Alamat tidak tersedia';

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Nota Pengiriman Kurir</h2>
        <div>
          <PDFDownloadLink
            document={<NotaPengirimanDocument data={notaData} />}
            fileName={`Nota_Pengiriman_${id_jadwal}.pdf`}
            style={{ textDecoration: 'none' }}
            className="me-2"
          >
            {({ loading }) => (
              <Button variant="primary" disabled={loading}>
                {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </div>

      <Card className="shadow mb-4" ref={printRef}>
        <Card.Body className="p-4" style={{maxWidth: '480px', margin: '0 auto'}}>
          <div className="text-center mb-3">
            <h5 className="mb-0 fw-bold">ReUse Mart</h5>
            <p className="small mb-0">Jl. Green Eco Park No. 456 Yogyakarta</p>
          </div>

          <div className="mb-3">
            <div className="d-flex">
              <div style={{width: '120px'}}>No Nota</div>
              <div>: {invoiceNumber}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Tanggal pesan</div>
              <div>: {formatDate(transaksi.tanggal_transaksi)}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Lunas pada</div>
              <div>: {formatDate(transaksi.tanggal_transaksi)}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Tanggal ambil</div>
              <div>: {formatDate(jadwal.tanggal)}</div>
            </div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          <div className="mb-3">
            <div className="d-flex">
              <div style={{width: '120px'}}>Pembeli</div>
              <div>: {buyerEmail} / {pembeli.nama_pembeli}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Alamat</div>
              <div className="text-wrap">: {formattedAddress}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Delivery</div>
              <div>: Kurir ReUseMart ({pegawai?.nama_pegawai || 'Tidak tersedia'})</div>
            </div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* Items */}
          {items.map((item, index) => (
            <div className="d-flex justify-content-between mb-1" key={index}>
              <div>{item.nama_barang}</div>
              <div>{formatCurrency(item.harga * (item.jumlah || 1))}</div>
            </div>
          ))}

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* Totals */}
          <div className="d-flex justify-content-between mb-1">
            <div>Total</div>
            <div>{formatCurrency(totalAmount)}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Ongkos Kirim</div>
            <div>0</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Total</div>
            <div>{formatCurrency(totalAmount)}</div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* QC Officer */}
          <div className="mb-1">QC oleh: {qcOfficer}</div>
          <div className="mb-2">Diambil oleh:</div>

          {/* Signature */}
          <div className="text-end" style={{marginTop: '40px'}}>
            <div style={{width: '150px', display: 'inline-block', textAlign: 'center'}}>
              <div style={{borderBottom: '1px dotted #000', marginBottom: '5px'}}>&nbsp;</div>
              <div>Tanggal: ...............................</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotaPenjualanKurir;
