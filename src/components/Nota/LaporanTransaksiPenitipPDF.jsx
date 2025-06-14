import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Table, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import axios from 'axios';
import { BASE_URL } from '../../api';
import { getAllTransaksi } from '../../api/TransaksiApi';
import { getPenitipanBarangById } from '../../api/PenitipanBarangApi';

const LaporanTransaksiPenitipPDF = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const printComponentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get filter params from location state if available
  const filterParams = location.state || {};
  
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

  useEffect(() => {
    const userInfo = getUserData();
    setUser(userInfo);
    
    // Check if user is owner based on the route
    const isOwnerRoute = location.pathname.startsWith('/owner');
    setIsOwner(isOwnerRoute);
    
    if (isOwnerRoute) {
      fetchAllData();
    } else if (userInfo && userInfo.id_penitip) {
      fetchPenitipData(userInfo.id_penitip);
    } else {
      setError('Data pengguna tidak ditemukan');
      setLoading(false);
    }
  }, [location.pathname]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Get all transactions
      const transaksiResponse = await getAllTransaksi();
      
      if (!transaksiResponse || !transaksiResponse.data) {
        throw new Error('Format data transaksi dari server tidak sesuai');
      }
      
      console.log('All Transaction Data:', transaksiResponse.data);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token autentikasi tidak ditemukan');
      }
      
      // Process and transform data
      let allBarangWithIncome = [];
      
      // Process each transaction
      for (const transaksi of transaksiResponse.data) {
        // Get transaction details with penitip info
        try {
          const penitipDetails = await axios.get(`${BASE_URL}/api/transaksi/${transaksi.id_transaksi}/penitipan-penitip`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const detailsData = penitipDetails.data || [];
          
          // Process each item in the transaction
          for (const item of detailsData) {
            try {
              // Calculate bonus (10% of price)
              const bonus = item.harga_item * 0.1;
              // Calculate total income
              const pendapatan = item.harga_item - bonus;
              
              // Log data untuk debugging
              console.log('Item data detail (PDF):', item);
              
              // Jika tidak ada tanggal_awal_penitipan dan ada id_penitipan, coba ambil data penitipan
              let tanggalPenitipan = item.tanggal_awal_penitipan || '-';
              
              if (tanggalPenitipan === '-' && item.id_penitipan) {
                try {
                  // Ambil data penitipan langsung dari API
                  console.log(`Fetching penitipan data for id_penitipan: ${item.id_penitipan}`);
                  const penitipanData = await getPenitipanBarangById(item.id_penitipan);
                  if (penitipanData && penitipanData.tanggal_awal_penitipan) {
                    tanggalPenitipan = penitipanData.tanggal_awal_penitipan;
                    console.log(`Found tanggal_awal_penitipan: ${tanggalPenitipan}`);
                  }
                } catch (penitipanErr) {
                  console.error(`Error fetching penitipan data for id ${item.id_penitipan}:`, penitipanErr);
                }
              }
              
              allBarangWithIncome.push({
                id_barang: item.id_barang,
                nama_barang: item.nama_barang,
                harga: item.harga_item,
                id_penitip: item.id_penitip,
                nama_penitip: item.nama_penitip || 'Tidak diketahui',
                tanggal_penitipan: tanggalPenitipan,
                tanggal_transaksi: transaksi.tanggal_transaksi || '-',
                id_transaksi: transaksi.id_transaksi,
                bonus: bonus,
                pendapatan: pendapatan
              });
            } catch (itemErr) {
              console.error(`Error processing item ${item.id_barang}:`, itemErr);
            }
          }
        } catch (err) {
          console.error(`Error fetching details for transaction ${transaksi.id_transaksi}:`, err);
        }
      }
      
      // Apply filters if any were passed in location state
      let filteredData = allBarangWithIncome;
      
      if (filterParams.startDate) {
        filteredData = filteredData.filter(item => {
          if (!item.tanggal_penitipan) return false;
          return new Date(item.tanggal_penitipan) >= new Date(filterParams.startDate);
        });
      }
      
      if (filterParams.endDate) {
        filteredData = filteredData.filter(item => {
          if (!item.tanggal_penitipan) return false;
          return new Date(item.tanggal_penitipan) <= new Date(filterParams.endDate);
        });
      }
      
      if (filterParams.searchTerm) {
        const searchLower = filterParams.searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.nama_barang && item.nama_barang.toLowerCase().includes(searchLower)) ||
          (item.id_barang && item.id_barang.toString().includes(searchLower)) ||
          (item.nama_penitip && item.nama_penitip.toLowerCase().includes(searchLower))
        );
      }
      
      setData(filteredData);
    } catch (err) {
      console.error("Error fetching all data:", err);
      setError(`Gagal memuat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenitipData = async (id_penitip) => {
    setLoading(true);
    try {
      // Get all penitipan for this penitip
      const response = await axios.get(`${BASE_URL}/api/penitip/${id_penitip}/penitipan`);
      
      if (!response.data || !response.data.data) {
        throw new Error('Format data dari server tidak sesuai');
      }
      
      const penitipanData = response.data.data || [];
      
      // Process data
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
              
              return {
                ...item,
                id_penitip,
                nama_penitip: user?.nama || user?.nama_penitip || 'Pengguna',
                tanggal_penitipan: penitipan.tanggal_awal_penitipan,
                tanggal_transaksi: item.updated_at || '-',
                bonus: bonus,
                pendapatan: pendapatan
              };
            });
            
          allBarangWithIncome = [...allBarangWithIncome, ...processedBarang];
        }
      }
      
      // Apply filters if any were passed in location state
      let filteredData = allBarangWithIncome;
      
      if (filterParams.startDate) {
        filteredData = filteredData.filter(item => {
          if (!item.tanggal_penitipan) return false;
          return new Date(item.tanggal_penitipan) >= new Date(filterParams.startDate);
        });
      }
      
      if (filterParams.endDate) {
        filteredData = filteredData.filter(item => {
          if (!item.tanggal_penitipan) return false;
          return new Date(item.tanggal_penitipan) <= new Date(filterParams.endDate);
        });
      }
      
      if (filterParams.searchTerm) {
        const searchLower = filterParams.searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.nama_barang && item.nama_barang.toLowerCase().includes(searchLower)) ||
          (item.id_barang && item.id_barang.toString().includes(searchLower))
        );
      }
      
      setData(filteredData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Gagal memuat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    contentRef: printComponentRef,
    documentTitle: isOwner ? 'Laporan Transaksi' : 'Laporan Transaksi Penitip',
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

  const handleBack = () => {
    if (isOwner) {
      navigate('/owner/laporan-transaksi');
    } else {
      navigate('/DashboardPenitip/laporan-pendapatan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return "-";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    if (!data.length) return { totalHarga: 0, totalBonus: 0, totalPendapatan: 0 };
    
    return data.reduce((acc, item) => {
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Memuat data laporan pendapatan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-3 d-print-none">
        <Button variant="secondary" onClick={handleBack} className="me-2">
          &laquo; Kembali
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          Cetak Laporan
        </Button>
      </div>

      {/* Direct rendering with ref */}
      <div ref={printComponentRef} className="p-4" style={{ width: '100%', minHeight: '500px' }}>
        <Card className="p-4 mb-4">
          <Card.Body>
            <div className="text-center mb-4">
              <h2>LAPORAN TRANSAKSI {isOwner ? '' : 'PENITIP'}</h2>
              <h4>ReuseMart</h4>
              <p className="text-muted">Pusat Daur Ulang dan Donasi Barang Bekas</p>
              <p>Tanggal Cetak: {formatDate(new Date())}</p>
            </div>

            {!isOwner && (
              <div className="mb-3">
                <h5>Data Penitip:</h5>
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td width="30%" className="fw-bold">ID Penitip</td>
                      <td>{user?.id_penitip || '-'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Nama Penitip</td>
                      <td>{user?.nama || user?.nama_penitip || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {data.length > 0 ? (
              <div className="mb-4">
                <h5>Daftar Barang Terjual:</h5>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>ID Barang</th>
                      <th>Nama Barang</th>
                      {isOwner && <th>Nama Penitip</th>}
                      <th>Tanggal Masuk</th>
                      <th>Tanggal Laku</th>
                      <th>Harga</th>
                      <th>Bonus</th>
                      <th>Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr key={item.id_barang}>
                        <td>{idx + 1}</td>
                        <td>{item.id_barang}</td>
                        <td>{item.nama_barang}</td>
                        {isOwner && <td>{item.nama_penitip}</td>}
                        <td>{formatDate(item.tanggal_penitipan)}</td>
                        <td>{formatDate(item.tanggal_transaksi)}</td>
                        <td>{formatCurrency(item.harga || 0)}</td>
                        <td>{formatCurrency(item.bonus || 0)}</td>
                        <td>{formatCurrency(item.pendapatan || 0)}</td>
                      </tr>
                    ))}
                    <tr className="table-success fw-bold">
                      <td colSpan={isOwner ? "6" : "5"} className="text-end">Total</td>
                      <td>{formatCurrency(totals.totalHarga)}</td>
                      <td>{formatCurrency(totals.totalBonus)}</td>
                      <td>{formatCurrency(totals.totalPendapatan)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <Alert variant="warning">
                  Tidak ada data transaksi yang ditemukan.
                </Alert>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LaporanTransaksiPenitipPDF; 