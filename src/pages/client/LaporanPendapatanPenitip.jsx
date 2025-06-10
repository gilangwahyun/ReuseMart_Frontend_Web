import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Alert, InputGroup, Form, Button, Spinner } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaPrint, FaFilter, FaTimes } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { getPenitipanByPenitipId, getPenitipTransaksiNota } from '../../api/PenitipApi'; 
import axios from 'axios';
import { BASE_URL } from '../../api';
import PenitipSidebar from '../../components/PenitipSidebar';
import { format } from 'date-fns';

const LaporanTransaksiPenitip = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barangData, setBarangData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const printComponentRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No user data found in localStorage');
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      return parsedUser;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  const user = getUserData();
  const id_penitip = user?.id_penitip;

  // Function to fetch data for the penitip
  const fetchData = async () => {
    if (!id_penitip) {
      setError('Data penitip tidak ditemukan');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Get penitipan and transaksi data in parallel
      const [penitipanResponse, transaksiNotaResponse] = await Promise.all([
        // Mendapatkan data penitipan untuk informasi dasar barang
        getPenitipanByPenitipId(id_penitip),
        // Mendapatkan data transaksi dan nota penjualan
        getPenitipTransaksiNota(id_penitip)
      ]);
      
      if (!penitipanResponse.data || !penitipanResponse.data.data) {
        throw new Error('Format data penitipan dari server tidak sesuai');
      }
      
      // Log data transaksi nota untuk debugging
      console.log('Data Transaksi dan Nota:', transaksiNotaResponse.data);
      
      const penitipanData = penitipanResponse.data.data || [];
      const transaksiNotaData = transaksiNotaResponse.data?.data || [];
      
      // Process and transform data
      let allBarangWithIncome = [];
      
      for (const penitipan of penitipanData) {
        if (penitipan.barang && Array.isArray(penitipan.barang)) {
          const processedBarang = penitipan.barang
            .filter(item => item.status_barang?.toLowerCase().includes('habis') ||
                            item.status_barang?.toLowerCase().includes('terjual'))
            .map(item => {
              // Calculate bonus (10% of price as an example)
              const bonus = item.harga * 0.1;
              // Calculate total income
              const pendapatan = item.harga - bonus;
              
                              // Cari data transaksi dan nota untuk barang ini dari transaksiNotaData
              const transaksiNotaBarang = transaksiNotaData.find(data => 
                data.id_barang === item.id_barang
              );
              
              // Log item untuk debugging
              console.log('Item data:', {
                id_barang: item.id_barang,
                status: item.status_barang,
                transaksi_nota_found: transaksiNotaBarang ? 'Ada' : 'Tidak ada'
              });
              
              // Tanggal masuk dari penitipan (data yang pasti ada)
              const tanggalMasuk = penitipan.tanggal_awal_penitipan;
              
              // Tanggal kirim dari nota penjualan (jika ada)
              const tanggalKirim = transaksiNotaBarang?.tanggal_kirim || '-';
              
              // Jika ada data transaksi, log detailnya
              if (transaksiNotaBarang) {
                console.log('Data transaksi nota barang:', {
                  id_barang: item.id_barang,
                  id_transaksi: transaksiNotaBarang.id_transaksi,
                  id_nota: transaksiNotaBarang.id_nota_penjualan,
                  tanggal_kirim: tanggalKirim
                });
              }
              
              return {
                ...item,
                id_penitip,
                nama_penitip: user.nama || user.nama_penitip || 'Pengguna',
                // Gunakan tanggal terbaik yang tersedia
                tanggal_masuk: tanggalMasuk || '-',
                // Gunakan tanggal kirim (dari nota atau yang digenerate)
                tanggal_kirim: tanggalKirim || '-',
                bonus: bonus,
                pendapatan: pendapatan
              };
            });
            
          allBarangWithIncome = [...allBarangWithIncome, ...processedBarang];
        }
      }
      
      setBarangData(allBarangWithIncome);
      setFilteredData(allBarangWithIncome);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Gagal memuat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id_penitip]);

  // Apply filters
  useEffect(() => {
    if (!barangData.length) return;
    
    let results = [...barangData];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(item => 
        (item.nama_barang && item.nama_barang.toLowerCase().includes(searchLower)) ||
        (item.id_barang && item.id_barang.toString().includes(searchLower))
      );
    }
    
    // Apply date range filter
    if (startDate) {
      results = results.filter(item => {
        if (!item.tanggal_masuk) return false;
        return new Date(item.tanggal_masuk) >= new Date(startDate);
      });
    }
    
    if (endDate) {
      results = results.filter(item => {
        if (!item.tanggal_masuk) return false;
        return new Date(item.tanggal_masuk) <= new Date(endDate);
      });
    }
    
    setFilteredData(results);
  }, [barangData, searchTerm, startDate, endDate]);
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return "-";
    try {
      // Handle different date formats consistently
      let dateObj;
      if (typeof dateString === 'string') {
        // Remove any time component and parse just the date
        const datePart = dateString.split('T')[0].split(' ')[0];
        dateObj = new Date(datePart);
      } else {
        dateObj = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', dateString);
        return "-";
      }
      
      return format(dateObj, 'dd MMMM yyyy');
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return "-";
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Tidak perlu lagi formatInfoTanggal karena hanya menampilkan satu tanggal
  
  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    contentRef: printComponentRef,
    documentTitle: 'Laporan Transaksi Penitip',
    onBeforeGetContent: () => {
      return new Promise(resolve => {
        console.log("Preparing content to print...");
        console.log("Print ref exists:", !!printComponentRef.current);
        resolve();
      });
    },
    onAfterPrint: () => console.log('Print completed'),
    removeAfterPrint: true,
  });

  // Calculate totals
  const calculateTotals = () => {
    if (!filteredData.length) return { totalHarga: 0, totalBonus: 0, totalPendapatan: 0 };
    
    return filteredData.reduce((acc, item) => {
      acc.totalHarga += Number(item.harga) || 0;
      acc.totalBonus += Number(item.bonus) || 0;
      acc.totalPendapatan += Number(item.pendapatan) || 0;
      return acc;
    }, { 
      totalHarga: 0, 
      totalBonus: 0, 
      totalPendapatan: 0 
    });
  };
  
  const totals = calculateTotals();

  return (
    <div className="d-flex">
      <PenitipSidebar />
      
      <Container fluid className="py-4 flex-grow-1">
        <Row>
          <Col>
            {/* Header Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0 text-success">Laporan Transaksi</h2>
                    <p className="text-muted mb-0">Data transaksi dari barang yang telah terjual</p>
                  </div>
                  <Button 
                    variant="success" 
                    onClick={handlePrint} 
                    disabled={filteredData.length === 0 || loading}
                  >
                    <FaPrint className="me-2" /> Cetak Laporan
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Search & Filter */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <h5 className="mb-3 mb-md-0">Cari & Filter</h5>
                  <div className="d-flex">
                    <Button 
                      variant={showFilter ? "success" : "outline-success"}
                      className="me-2"
                      onClick={() => setShowFilter(!showFilter)}
                    >
                      <FaFilter className="me-2" />
                      Filter
                    </Button>
                    {(searchTerm || startDate || endDate) && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleResetFilters}
                      >
                        <FaTimes className="me-2" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="bg-success text-white">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Cari berdasarkan nama barang atau ID barang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {showFilter && (
                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tanggal Mulai</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-success text-white">
                            <FaCalendarAlt />
                          </InputGroup.Text>
                          <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tanggal Akhir</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-success text-white">
                            <FaCalendarAlt />
                          </InputGroup.Text>
                          <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Error message */}
            {error && (
              <Alert 
                variant="danger" 
                className="mb-4" 
                dismissible 
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* Data Table Card */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
                <p className="mt-2">Memuat data transaksi...</p>
              </div>
            ) : (
              <Card className="shadow-sm">
                <Card.Header className="bg-success text-white py-3">
                  <h5 className="mb-0">Data Transaksi ({filteredData.length} barang)</h5>
                </Card.Header>
                <Card.Body>
                  {filteredData.length > 0 ? (
                    <div className="table-responsive">
                      <Table responsive striped hover className="mb-0">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>ID Barang</th>
                            <th>Nama Barang</th>
                            <th>Tanggal Masuk</th>
                            <th>Tanggal Kirim</th>
                            <th>Harga</th>
                            <th>Bonus</th>
                            <th>Pendapatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, idx) => (
                            <tr key={item.id_barang}>
                              <td>{idx + 1}</td>
                              <td>{item.id_barang}</td>
                              <td>{item.nama_barang}</td>
                              <td>{formatDate(item.tanggal_masuk)}</td>
                              <td>{formatDate(item.tanggal_kirim)}</td>
                              <td>{formatCurrency(item.harga || 0)}</td>
                              <td>{formatCurrency(item.bonus || 0)}</td>
                              <td>{formatCurrency(item.pendapatan || 0)}</td>
                            </tr>
                          ))}
                          <tr className="table-success fw-bold">
                            <td colSpan="5" className="text-end">Total</td>
                            <td>{formatCurrency(totals.totalHarga)}</td>
                            <td>{formatCurrency(totals.totalBonus)}</td>
                            <td>{formatCurrency(totals.totalPendapatan)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-0 text-muted">
                        {searchTerm || startDate || endDate
                          ? 'Tidak ada data pendapatan yang sesuai dengan filter'
                          : 'Belum ada data pendapatan'}
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* Printable Component (hidden) */}
        <div style={{ display: 'none' }}>
          <div ref={printComponentRef} className="p-4">
            <div className="text-center mb-4">
              <h2>LAPORAN TRANSAKSI PENITIP</h2>
              <h4>ReuseMart</h4>
              <p>Pusat Daur Ulang dan Donasi Barang Bekas</p>
              <p>Tanggal Cetak: {formatDate(new Date())}</p>
            </div>

            <div className="mb-3">
              <h5>Data Penitip:</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td width="30%" className="fw-bold">ID Penitip</td>
                    <td>{id_penitip}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Nama Penitip</td>
                    <td>{user?.nama || user?.nama_penitip || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-4">
              <h5>Daftar Barang Terjual:</h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>ID Barang</th>
                    <th>Nama Barang</th>
                    <th>Tanggal Masuk</th>
                    <th>Tanggal Kirim</th>
                    <th>Harga</th>
                    <th>Bonus</th>
                    <th>Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={item.id_barang}>
                      <td>{idx + 1}</td>
                      <td>{item.id_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{formatDate(item.tanggal_masuk)}</td>
                      <td>{formatDate(item.tanggal_kirim)}</td>
                      <td>{formatCurrency(item.harga || 0)}</td>
                      <td>{formatCurrency(item.bonus || 0)}</td>
                      <td>{formatCurrency(item.pendapatan || 0)}</td>
                    </tr>
                  ))}
                  <tr className="table-success fw-bold">
                    <td colSpan="5" className="text-end">Total</td>
                    <td>{formatCurrency(totals.totalHarga)}</td>
                    <td>{formatCurrency(totals.totalBonus)}</td>
                    <td>{formatCurrency(totals.totalPendapatan)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LaporanTransaksiPenitip; 