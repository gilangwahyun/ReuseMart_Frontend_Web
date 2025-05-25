import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Alert, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../api';
import PenitipSidebar from '../../components/PenitipSidebar';

const DaftarBarangPenitip = () => {
  const [barang, setBarang] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debug, setDebug] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [kategoriList, setKategoriList] = useState([]);
  const [statusList, setStatusList] = useState([
    'Tersedia',
    'Terjual',
    'Donasi',
    'Tidak Aktif'
  ]);
  
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
  
  // Function to fetch penitip data if not already available
  const fetchMissingPenitipData = async () => {
    if (user && user.role === 'Penitip' && user.id_user && !user.id_penitip) {
      try {
        console.log('Fetching penitip data for user_id:', user.id_user);
        const response = await axios.get(`${BASE_URL}/api/user/${user.id_user}/penitip-data`);
        
        if (response.data && response.data.id_penitip) {
          // Update local storage with the new data
          const updatedUser = { ...user, id_penitip: response.data.id_penitip };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('Updated user data in localStorage with id_penitip:', response.data.id_penitip);
          return response.data.id_penitip;
        }
      } catch (error) {
        console.error('Failed to fetch penitip data:', error);
      }
    }
    return null;
  };

  // Fetch all unique categories from barang items
  const extractCategories = (barangItems) => {
    const categories = new Set();
    
    barangItems.forEach(item => {
      if (item.kategori?.nama_kategori) {
        categories.add(item.kategori.nama_kategori);
      }
    });
    
    return Array.from(categories);
  };
  
  // Function to fetch penitipan data and extract barang
  const fetchBarangData = async () => {
    // First check if we need to fetch the id_penitip
    let currentIdPenitip = id_penitip;
    
    if (!currentIdPenitip && user && user.role === 'Penitip' && user.id_user) {
      console.log('No id_penitip found, attempting to fetch it...');
      const fetchedIdPenitip = await fetchMissingPenitipData();
      currentIdPenitip = fetchedIdPenitip;
    }
    
    if (!currentIdPenitip) {
      console.error('No id_penitip found - user authentication issue');
      setError('Pengguna tidak ditemukan. Silakan login kembali.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get all penitipan for this penitip
      const response = await axios.get(`${BASE_URL}/api/penitip/${currentIdPenitip}/penitipan`);
      
      if (!response.data) {
        throw new Error('Tidak ada data yang diterima dari server');
      }
      
      // Check for success flag in response format
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Terjadi kesalahan pada server');
      }
      
      // Handle response format
      const penitipanData = response.data.data || response.data;
      
      if (!Array.isArray(penitipanData)) {
        throw new Error('Format data dari server tidak sesuai');
      }

      // Collect all barang from each penitipan
      let allBarang = [];
      for (const penitipanItem of penitipanData) {
        if (penitipanItem.barang && Array.isArray(penitipanItem.barang)) {
          // Add penitipan data to each barang for reference
          const barangWithPenitipan = penitipanItem.barang.map(barangItem => {
            return {
              ...barangItem,
              kategori_nama: barangItem.kategori?.nama_kategori || 'Tidak ada kategori',
              penitipan_info: {
                id_penitipan: penitipanItem.id_penitipan,
                tanggal_awal: penitipanItem.tanggal_awal_penitipan,
                tanggal_akhir: penitipanItem.tanggal_akhir_penitipan,
                nama_petugas_qc: penitipanItem.nama_petugas_qc
              }
            };
          });
          
          allBarang = [...allBarang, ...barangWithPenitipan];
        }
      }
      
      // Store the barang data
      setBarang(allBarang);
      setFilteredBarang(allBarang);
      
      // Extract categories for filter
      const categories = extractCategories(allBarang);
      setKategoriList(categories);
      
    } catch (error) {
      console.error("Error:", error);
      setError(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarangData();
  }, [id_penitip]);

  // Apply filters and search
  useEffect(() => {
    let result = [...barang];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => 
        // Search by nama barang
        (item.nama_barang && item.nama_barang.toLowerCase().includes(searchLower)) ||
        // Search by deskripsi
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchLower)) ||
        // Search by kategori
        (item.kategori_nama && item.kategori_nama.toLowerCase().includes(searchLower)) ||
        // Search by status barang
        (item.status_barang && item.status_barang.toLowerCase().includes(searchLower)) ||
        // Search by harga (convert to string for search)
        (item.harga && item.harga.toString().includes(searchLower)) ||
        // Search by berat (convert to string for search)
        (item.berat && item.berat.toString().includes(searchLower)) ||
        // Search by tanggal awal penitipan
        (item.penitipan_info?.tanggal_awal && item.penitipan_info.tanggal_awal.toLowerCase().includes(searchLower)) ||
        // Search by tanggal akhir penitipan
        (item.penitipan_info?.tanggal_akhir && item.penitipan_info.tanggal_akhir.toLowerCase().includes(searchLower)) ||
        // Search by formatted dates (e.g., "5 juli 2023")
        (item.penitipan_info?.tanggal_awal && formatDate(item.penitipan_info.tanggal_awal).toLowerCase().includes(searchLower)) ||
        (item.penitipan_info?.tanggal_akhir && formatDate(item.penitipan_info.tanggal_akhir).toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (filterStatus) {
      result = result.filter(item => {
        const itemStatus = item.status_barang ? item.status_barang.toLowerCase() : '';
        return itemStatus.includes(filterStatus.toLowerCase());
      });
    }
    
    // Apply kategori filter
    if (filterKategori) {
      result = result.filter(item => 
        item.kategori_nama === filterKategori
      );
    }
    
    setFilteredBarang(result);
  }, [search, filterStatus, filterKategori, barang]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterKategori('');
    setShowFilter(false);
  };

  // Helper function to get status badge based on status_barang
  const getBarangStatusBadge = (statusBarang) => {
    if (!statusBarang) return <Badge bg="secondary">Tidak Ada</Badge>;
    
    const statusLower = statusBarang.toLowerCase();
    
    if (statusLower.includes('tersedia')) {
      return <Badge bg="success">Tersedia</Badge>;
    } else if (statusLower.includes('terjual')) {
      return <Badge bg="info">Terjual</Badge>;
    } else if (statusLower.includes('donasi')) {
      return <Badge bg="primary">Donasi</Badge>;
    } else if (statusLower.includes('tidak aktif') || statusLower.includes('nonaktif')) {
      return <Badge bg="secondary">Tidak Aktif</Badge>;
    } else {
      return <Badge bg="secondary">{statusBarang}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
                    <h2 className="mb-0">Daftar Barang Saya</h2>
                    {user && <p className="text-muted mb-0">{user.nama || ''}</p>}
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            {/* Main Content */}
            {loading ? (
              <div className="text-center py-5">Memuat data...</div>
            ) : error ? (
              <Alert variant="danger" className="my-3">
                {error}
              </Alert>
            ) : (
              <>
                {/* Search and Filter Bar */}
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                      <h5 className="mb-3 mb-md-0">Cari Barang</h5>
                      <div className="d-flex">
                        <Button 
                          variant={showFilter ? "primary" : "outline-primary"}
                          className="me-2"
                          onClick={() => setShowFilter(!showFilter)}
                        >
                          <FaFilter className="me-2" />
                          Filter
                        </Button>
                        {(filterStatus || filterKategori) && (
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
                    
                    <InputGroup>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Cari berdasarkan nama, kategori, harga, status, berat, tgl mulai, tgl akhir..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </InputGroup>
                    
                    {showFilter && (
                      <div className="mt-3 p-3 border rounded">
                        <Row>
                          <Col md={6} className="mb-3 mb-md-0">
                            <Form.Group>
                              <Form.Label>Status Barang</Form.Label>
                              <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                              >
                                <option value="">Semua Status</option>
                                {statusList.map((status, idx) => (
                                  <option key={idx} value={status}>{status}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Kategori</Form.Label>
                              <Form.Select
                                value={filterKategori}
                                onChange={(e) => setFilterKategori(e.target.value)}
                              >
                                <option value="">Semua Kategori</option>
                                {kategoriList.map((kategori, idx) => (
                                  <option key={idx} value={kategori}>{kategori}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card.Body>
                </Card>
                
                {/* Success Message */}
                {successMessage && (
                  <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}
                
                {/* Data Table */}
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white py-3">
                    <h5 className="mb-0">Daftar Barang ({filteredBarang.length})</h5>
                  </Card.Header>
                  <Card.Body>
                    {filteredBarang.length > 0 ? (
                      <div className="table-responsive">
                        <Table responsive striped hover className="mb-0">
                          <thead>
                            <tr>
                              <th>Nama Barang</th>
                              <th>Kategori</th>
                              <th>Harga</th>
                              <th>Status</th>
                              <th>Berat (g)</th>
                              <th>Tgl Mulai Penitipan</th>
                              <th>Tgl Akhir Penitipan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBarang.map((item) => (
                              <tr key={item.id_barang}>
                                <td>{item.nama_barang}</td>
                                <td>{item.kategori_nama}</td>
                                <td>{formatCurrency(item.harga || 0)}</td>
                                <td>{getBarangStatusBadge(item.status_barang)}</td>
                                <td>{item.berat || '-'}</td>
                                <td>{formatDate(item.penitipan_info?.tanggal_awal)}</td>
                                <td>{formatDate(item.penitipan_info?.tanggal_akhir)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="mb-0 text-muted">
                          {search || filterStatus || filterKategori
                            ? 'Tidak ada barang yang sesuai dengan pencarian/filter.'
                            : 'Belum ada barang yang dititipkan.'}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DaftarBarangPenitip; 