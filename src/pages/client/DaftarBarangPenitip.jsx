import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Alert, InputGroup, Button, Modal, Carousel, Spinner } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes, FaInfoCircle, FaCalendarAlt, FaHandPaper, FaCheck } from 'react-icons/fa';
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
  
  // Date filter state
  const [startDate, setStartDate] = useState('');
  
  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [barangPhotos, setBarangPhotos] = useState([]);
  
  // Request Pengambilan state
  const [showRequestPengambilanModal, setShowRequestPengambilanModal] = useState(false);
  const [tanggalPengambilan, setTanggalPengambilan] = useState('');
  const [requestPengambilanLoading, setRequestPengambilanLoading] = useState(false);
  const [requestedBarangIds, setRequestedBarangIds] = useState([]);
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [kategoriList, setKategoriList] = useState([]);
  const [statusList, setStatusList] = useState([
    'Aktif',
    'Non Aktif',
    'Barang sudah Didonasikan',
    'Sudah Diambil'
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
        (item.berat && item.berat.toString().includes(searchLower))
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
    
    // Apply date filter - only exact date match
    if (startDate) {
      const selectedDate = new Date(startDate);
      result = result.filter(item => {
        if (!item.penitipan_info?.tanggal_awal) return false;
        
        const itemDate = new Date(item.penitipan_info.tanggal_awal);
        
        // Compare year, month, and day for exact date match
        return (
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getDate() === selectedDate.getDate()
        );
      });
    }
    
    setFilteredBarang(result);
  }, [search, filterStatus, filterKategori, startDate, barang]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterKategori('');
    setStartDate('');
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
  
  // Handle click on Detail button
  const handleShowDetail = async (barangItem) => {
    setSelectedBarang(barangItem);
    setShowDetailModal(true);
    setLoadingDetail(true);
    setBarangPhotos([]);
    
    try {
      // Initialize photo data
      let photoFound = false;
      
      // Try a direct storage path without an API call first - this is more reliable
      const directPhotoUrls = [
        // Direct Laravel storage/public paths
        `/storage/barang/${barangItem.id_barang}.jpg`,
        `/storage/barang/${barangItem.id_barang}.jpeg`,
        `/storage/barang/${barangItem.id_barang}.png`,
        `/storage/barang/${barangItem.id_barang}.webp`,
        `/storage/barang/${barangItem.id_penitipan || ''}_fotoBarang_${barangItem.id_barang}.jfif`,
        `/storage/barang/${barangItem.id_barang}_fotoBarang_${barangItem.id_barang}.jfif`,
        `/storage/foto_barang/${barangItem.id_barang}.jpg`,
        `/storage/barang/foto_${barangItem.id_barang}.jpg`
      ];
      
      // Create a simple photo object
      const photoObj = {
        id_foto_barang: 'direct',
        url_foto: directPhotoUrls[0], // Default to first URL
        fullUrls: directPhotoUrls.map(path => `${BASE_URL}${path}`), // Convert to full URLs
        direct_path: true
      };
      
      // Set it immediately to avoid extra render cycles
      setBarangPhotos([photoObj]);
      
    } catch (error) {
      console.error("Error setting up photo display:", error);
      
      // Use a simple placeholder
      setBarangPhotos([{
        id_foto_barang: 'placeholder',
        url_foto: 'placeholder',
        error: true
      }]);
    } finally {
      setLoadingDetail(false);
    }
  };
  
  // Close detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedBarang(null);
    setBarangPhotos([]);
  };

  // New helper to determine if a URL exists (for testing in browser)
  const testImageUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // Function to render a single photo with robust error handling
  const renderPhotoDisplay = () => {
    if (loadingDetail) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Memuat gambar...</p>
        </div>
      );
    }
    
    if (!barangPhotos || barangPhotos.length === 0) {
      return (
        <div className="text-center py-5 bg-light">
          <p className="mb-0">Tidak ada foto tersedia</p>
          <small className="text-muted">
            Foto belum diunggah untuk barang ini.
          </small>
        </div>
      );
    }
    
    // Get the single photo
    const foto = barangPhotos[0];
    
    // If this is a direct path photo object
    if (foto.direct_path && foto.fullUrls && foto.fullUrls.length > 0) {
      return (
        <>
          <div className="photo-container" style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <DirectImageWithFallbacks 
              urls={foto.fullUrls}
              altText={`Foto ${selectedBarang?.nama_barang || 'Barang'}`}
            />
          </div>
          <div className="text-center mt-2 small text-muted">
            <span>Foto barang</span>
          </div>
        </>
      );
    }
    
    // For error or fallback case
    return (
      <>
        <div className="text-center py-5 bg-light" style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="mb-3" style={{ fontSize: '3rem', opacity: '0.3' }}>
            <i className="bi bi-image"></i>
          </div>
          <p className="mb-1">Foto tidak tersedia</p>
          <small className="text-muted">
            Foto barang belum diunggah atau tidak dapat diakses.
          </small>
        </div>
      </>
    );
  };
  
  // Component to handle image fallbacks
  const DirectImageWithFallbacks = ({ urls, altText }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    
    // To prevent console spam
    const [errorLogged, setErrorLogged] = useState(false);
    
    const handleError = () => {
      if (!errorLogged) {
        console.log(`Image failed to load: ${urls[currentIndex]}`);
        setErrorLogged(true);
      }
      
      if (currentIndex < urls.length - 1) {
        // Try next URL
        setCurrentIndex(currentIndex + 1);
        setLoading(true);
      } else {
        // All URLs failed
        setFailed(true);
        setLoading(false);
      }
    };
    
    const handleLoad = () => {
      setLoading(false);
      console.log(`Image loaded successfully: ${urls[currentIndex]}`);
    };
    
    // If all URLs have failed
    if (failed) {
      return (
        <div className="text-center">
          <div style={{ fontSize: '3rem', color: '#dee2e6' }}>
            <i className="bi bi-image"></i>
          </div>
          <p className="small text-muted mt-2">Tidak ada foto</p>
        </div>
      );
    }
    
    return (
      <>
        {loading && (
          <div className="position-absolute" style={{ 
            top: 0, left: 0, right: 0, bottom: 0, 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(248, 249, 250, 0.7)',
            zIndex: 1
          }}>
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="small">Memuat...</span>
          </div>
        )}
        <img
          src={urls[currentIndex]}
          alt={altText}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
          onError={handleError}
          onLoad={handleLoad}
        />
      </>
    );
  };

  // Function to check if a status is "Tidak Aktif" regardless of format variations
  const isStatusTidakAktif = (status) => {
    if (!status) return false;
    
    // Convert to string and lowercase, remove spaces
    const normalizedStatus = status.toString().toLowerCase().replace(/\s+/g, '');
    
    // Check against possible variations
    return (
      normalizedStatus === 'tidakaktif' || 
      normalizedStatus === 'tidak-aktif' ||
      normalizedStatus === 'tidak_aktif' ||
      normalizedStatus === 'nonaktif' ||
      normalizedStatus === 'non-aktif' ||
      normalizedStatus === 'non_aktif'
    );
  };

  // Function to fetch pending request pengambilan data for this penitip
  const fetchRequestPengambilanData = async (penitipId) => {
    if (!penitipId) return;
    
    try {
      const response = await axios.get(`${BASE_URL}/api/request-pengambilan/penitip/${penitipId}`);
      console.log('Request pengambilan data:', response.data);
      
      // Extract the IDs of requested barang
      const requestedIds = response.data.map(req => req.id_barang);
      console.log('Requested barang IDs:', requestedIds);
      
      setRequestedBarangIds(requestedIds);
    } catch (error) {
      console.error('Error fetching request pengambilan data:', error);
    }
  };

  // Update useEffect to also fetch request pengambilan data
  useEffect(() => {
    fetchBarangData();
    
    const user = getUserData();
    if (user && user.id_penitip) {
      fetchRequestPengambilanData(user.id_penitip);
    }
  }, []);

  // Function to handle Request Pengambilan button click
  const handleRequestPengambilan = (barangItem) => {
    setSelectedBarang(barangItem);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTanggalPengambilan(tomorrow.toISOString().split('T')[0]);
    setShowRequestPengambilanModal(true);
  };

  // Function to submit request pengambilan
  const handleSubmitRequestPengambilan = async () => {
    if (!selectedBarang || !tanggalPengambilan) return;
    
    setRequestPengambilanLoading(true);
    
    try {
      const user = getUserData();
      
      const requestData = {
        id_penitip: user.id_penitip,
        id_barang: selectedBarang.id_barang,
        tanggal_pengambilan: tanggalPengambilan,
      };
      
      console.log('Sending request pengambilan data:', requestData);
      
      // Send request to API with the correct endpoint
      const response = await axios.post(
        `${BASE_URL}/api/request-pengambilan`,
        requestData
      );
      
      console.log('Request pengambilan response:', response.data);
      
      // Add the barang ID to the list of requested items
      setRequestedBarangIds(prev => [...prev, selectedBarang.id_barang]);
      
      // Update state and show success message
      setShowRequestPengambilanModal(false);
      setSuccessMessage('Request pengambilan barang berhasil dikirim!');
      
    } catch (error) {
      console.error('Error submitting request pengambilan:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError('Gagal mengirim request pengambilan: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'));
    } finally {
      setRequestPengambilanLoading(false);
    }
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
                    <h2 className="mb-0 text-success">Daftar Barang Saya</h2>
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
                          variant={showFilter ? "success" : "outline-success"}
                          className="me-2"
                          onClick={() => setShowFilter(!showFilter)}
                        >
                          <FaFilter className="me-2" />
                          Filter
                        </Button>
                        {(filterStatus || filterKategori || startDate) && (
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
                      <InputGroup.Text className="bg-success text-white">
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Cari berdasarkan nama, kategori, harga, status, berat..."
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
                        <Row className="mt-3">
                          <Col>
                            <Form.Group>
                              <Form.Label>Tanggal Mulai Penitipan</Form.Label>
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
                  <Card.Header className="bg-success text-white py-3">
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
                              <th>Aksi</th>
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
                                <td>
                                  <div className="d-flex">
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      onClick={() => handleShowDetail(item)}
                                      className="me-1"
                                    >
                                      <FaInfoCircle className="me-1" /> Detail
                                    </Button>
                                    
                                    {isStatusTidakAktif(item.status_barang) && !requestedBarangIds.includes(item.id_barang) && (
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleRequestPengambilan(item)}
                                      >
                                        <FaHandPaper className="me-1" /> Request Ambil
                                      </Button>
                                    )}
                                    
                                    {isStatusTidakAktif(item.status_barang) && requestedBarangIds.includes(item.id_barang) && (
                                      <Button
                                        variant="success"
                                        size="sm"
                                        disabled
                                      >
                                        <FaCheck className="me-1" /> Sudah Direquest
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="mb-0 text-muted">
                          {search || filterStatus || filterKategori || startDate
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
      
      {/* Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={handleCloseDetail}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Detail Barang</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBarang ? (
            <Row>
              <Col md={6} className="mb-4 mb-md-0">
                {renderPhotoDisplay()}
              </Col>
              <Col md={6}>
                <h4 className="text-success">{selectedBarang.nama_barang}</h4>
                <p className="mb-3">{getBarangStatusBadge(selectedBarang.status_barang)}</p>
                
                <dl className="row mb-0">
                  <dt className="col-sm-5">Kategori</dt>
                  <dd className="col-sm-7">{selectedBarang.kategori_nama}</dd>
                  
                  <dt className="col-sm-5">Harga</dt>
                  <dd className="col-sm-7">{formatCurrency(selectedBarang.harga || 0)}</dd>
                  
                  <dt className="col-sm-5">Berat</dt>
                  <dd className="col-sm-7">{selectedBarang.berat ? `${selectedBarang.berat} gram` : '-'}</dd>
                  
                  <dt className="col-sm-5">Deskripsi</dt>
                  <dd className="col-sm-7">{selectedBarang.deskripsi || '-'}</dd>
                  
                  <dt className="col-sm-5">Mulai Penitipan</dt>
                  <dd className="col-sm-7">{formatDate(selectedBarang.penitipan_info?.tanggal_awal)}</dd>
                  
                  <dt className="col-sm-5">Akhir Penitipan</dt>
                  <dd className="col-sm-7">{formatDate(selectedBarang.penitipan_info?.tanggal_akhir)}</dd>
                  
                  <dt className="col-sm-5">Petugas QC</dt>
                  <dd className="col-sm-7">{selectedBarang.penitipan_info?.nama_petugas_qc || '-'}</dd>
                </dl>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-3">Data tidak tersedia</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Request Pengambilan Modal */}
      <Modal show={showRequestPengambilanModal} onHide={() => setShowRequestPengambilanModal(false)}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Request Pengambilan Barang</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBarang && (
            <div>
              <p>Anda akan mengajukan request pengambilan untuk barang:</p>
              
              <Table bordered className="mt-3 mb-4">
                <tbody>
                  <tr>
                    <td className="bg-light" width="30%">Nama Barang</td>
                    <td>{selectedBarang.nama_barang}</td>
                  </tr>
                  <tr>
                    <td className="bg-light">Kategori</td>
                    <td>{selectedBarang.kategori_nama || 'Tidak ada kategori'}</td>
                  </tr>
                  <tr>
                    <td className="bg-light">Status</td>
                    <td>{getBarangStatusBadge(selectedBarang.status_barang)}</td>
                  </tr>
                </tbody>
              </Table>
              
              <Form.Group className="mb-3">
                <Form.Label>Tanggal Pengambilan</Form.Label>
                <Form.Control
                  type="date"
                  value={tanggalPengambilan}
                  onChange={(e) => setTanggalPengambilan(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Today as minimum date
                  required
                />
                <Form.Text className="text-muted">
                  Pilih tanggal kapan Anda ingin mengambil barang.
                </Form.Text>
              </Form.Group>
              
              <Alert variant="success" className="mt-3">
                <small>
                  Request pengambilan akan diproses oleh Pegawai Gudang. Anda akan dihubungi 
                  jika request telah disetujui dan dapat mengambil barang pada tanggal yang ditentukan.
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestPengambilanModal(false)}>
            Batal
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmitRequestPengambilan} 
            disabled={requestPengambilanLoading || !tanggalPengambilan}
          >
            {requestPengambilanLoading ? 'Memproses...' : 'Kirim Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DaftarBarangPenitip; 