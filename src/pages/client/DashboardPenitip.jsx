import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Alert, InputGroup, Button, Modal } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaCalendarPlus } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../api';

// Log API URL for debugging
console.log('API BASE_URL:', BASE_URL);

const DashboardPenitip = () => {
  const [penitipan, setPenitipan] = useState([]);
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debug, setDebug] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [extendedEndDate, setExtendedEndDate] = useState(null);
  const [extendLoading, setExtendLoading] = useState(false);

  // Function to handle perpanjang (extend) button click
  const handlePerpanjangClick = (item) => {
    // Calculate the new end date (30 days after current end date)
    const currentEndDate = new Date(item.penitipan_info.tanggal_akhir);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + 30);
    
    setSelectedPenitipan(item);
    setExtendedEndDate(newEndDate);
    setShowModal(true);
  };

  // Function to submit the extension
  const handleExtendSubmit = async () => {
    if (!selectedPenitipan) return;
    
    setExtendLoading(true);
    
    try {
      // Current end date becomes the new start date
      const newStartDate = new Date(selectedPenitipan.penitipan_info.tanggal_akhir);
      // Extended date (30 days later) becomes the new end date
      const newEndDate = extendedEndDate;
      
      // Format dates for the API in YYYY-MM-DD HH:MM:SS format
      const formatDate = (date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };
      
      const updateData = {
        tanggal_awal_penitipan: formatDate(newStartDate),
        tanggal_akhir_penitipan: formatDate(newEndDate)
      };
      
      console.log('Sending extension request with data:', updateData);
      
      // Send the update to the API
      const response = await axios.put(
        `${BASE_URL}/api/penitipanBarang/${selectedPenitipan.penitipan_info.id_penitipan}`,
        updateData
      );
      
      console.log('Extension response:', response.data);
      
      // Update the local data
      const updatedBarang = barang.map(item => {
        if (item.penitipan_info.id_penitipan === selectedPenitipan.penitipan_info.id_penitipan) {
          return {
            ...item,
            penitipan_info: {
              ...item.penitipan_info,
              tanggal_awal: formatDate(newStartDate),
              tanggal_akhir: formatDate(newEndDate)
            }
          };
        }
        return item;
      });
      
      // Update state
      setBarang(updatedBarang);
      setShowModal(false);
      
      // Fetch fresh data
      fetchPenitipanData();
      
      // Set success message
      setSuccessMessage('Masa penitipan berhasil diperpanjang!');
      
    } catch (error) {
      console.error('Error extending penitipan:', error);
      setError('Gagal memperpanjang masa penitipan: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setExtendLoading(false);
    }
  };

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      console.log('Raw user data from localStorage:', userData);
      
      if (!userData) {
        console.error('No user data found in localStorage');
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      
      if (parsedUser && parsedUser.role === 'Penitip' && !parsedUser.id_penitip) {
        console.warn('User is Penitip but missing id_penitip! Need to fetch related data.');
        // Will need to fetch the id_penitip
      }
      
      console.log('User ID Penitip:', parsedUser?.id_penitip);
      
      return parsedUser;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  const user = getUserData();
  const id_penitip = user?.id_penitip;
  
  console.log('Current user object:', user);
  console.log('Current id_penitip value:', id_penitip);

  // Function to fetch penitip data if not already available
  const fetchMissingPenitipData = async () => {
    if (user && user.role === 'Penitip' && user.id_user && !user.id_penitip) {
      try {
        console.log('Fetching penitip data for user_id:', user.id_user);
        const response = await axios.get(`${BASE_URL}/api/user/${user.id_user}/penitip-data`);
        console.log('Fetched penitip data:', response.data);
        
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

  // Function to fetch penitipan data
  const fetchPenitipanData = async () => {
    // First check if we need to fetch the id_penitip
    let currentIdPenitip = id_penitip;
    
    if (!currentIdPenitip && user && user.role === 'Penitip' && user.id_user) {
      console.log('No id_penitip found, attempting to fetch it...');
      const fetchedIdPenitip = await fetchMissingPenitipData();
      currentIdPenitip = fetchedIdPenitip;
      console.log('Fetched id_penitip:', currentIdPenitip);
    }
    
    if (!currentIdPenitip) {
      console.error('No id_penitip found - user authentication issue');
      setError('Pengguna tidak ditemukan. Silakan login kembali.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to fetch data for penitip with ID: ${currentIdPenitip}`);
      
      // Try to access the API
      try {
        // Check if API is reachable first
        const testResponse = await axios.get(`${BASE_URL}/api/test-database`);
        console.log('Test API response:', testResponse.data);
        
        // Get all penitipan for this penitip
        console.log(`Making API call to: ${BASE_URL}/api/penitip/${currentIdPenitip}/penitipan`);
        const response = await axios.get(`${BASE_URL}/api/penitip/${currentIdPenitip}/penitipan`);
        console.log('API Response:', response);
        console.log('API Response data:', response.data);
        
        if (!response.data) {
          throw new Error('Tidak ada data yang diterima dari server');
        }
        
        // Check for success flag in new response format
        if (response.data.success === false) {
          throw new Error(response.data.message || 'Terjadi kesalahan pada server');
        }
        
        // Handle new response format
        const penitipanData = response.data.data || response.data;
        
        if (!Array.isArray(penitipanData)) {
          throw new Error('Format data dari server tidak sesuai');
        }

        console.log(`Received ${penitipanData.length} penitipan records`);
        setPenitipan(penitipanData);
        
        // Debug: Log the first penitipan item with its fields
        if (penitipanData.length > 0) {
          console.log('First penitipan record structure:');
          
          const firstItem = penitipanData[0];
          console.log('Object keys:', Object.keys(firstItem));
          
          console.log('Fields:');
          for (const key in firstItem) {
            console.log(`  - ${key}: ${typeof firstItem[key]} = ${
              typeof firstItem[key] === 'object' 
                ? (Array.isArray(firstItem[key]) 
                    ? `Array(${firstItem[key]?.length || 0})` 
                    : (firstItem[key] === null ? 'null' : 'Object'))
                : firstItem[key]
            }`);
          }
          
          if ('barang' in firstItem) {
            console.log('Barang property details:');
            console.log('  Type:', typeof firstItem.barang);
            console.log('  Is Array:', Array.isArray(firstItem.barang));
            console.log('  Length:', Array.isArray(firstItem.barang) ? firstItem.barang.length : 'N/A');
            
            if (Array.isArray(firstItem.barang) && firstItem.barang.length > 0) {
              console.log('  First barang item keys:', Object.keys(firstItem.barang[0]));
            }
          } else {
            console.log('Barang property missing!');
          }
        }
        
        // Debug: Log the full penitipan data structure
        console.log('Full penitipan data structure:', JSON.stringify(penitipanData, null, 2));
        
        // Collect all barang from each penitipan
        let allBarang = [];
        for (const penitipanItem of penitipanData) {
          console.log('Processing penitipan ID:', penitipanItem.id_penitipan);
          console.log('Penitipan details:', {
            id_penitip: penitipanItem.id_penitip,
            tanggal_awal: penitipanItem.tanggal_awal_penitipan,
            tanggal_akhir: penitipanItem.tanggal_akhir_penitipan
          });
          
          if (penitipanItem.barang && Array.isArray(penitipanItem.barang)) {
            console.log('Found barang array with length:', penitipanItem.barang.length);
            console.log('First few barang items:', penitipanItem.barang.slice(0, 3));
            
            // Add penitipan data to each barang for reference
            const barangWithPenitipan = penitipanItem.barang.map(barangItem => {
              console.log('Processing barang item ID:', barangItem.id_barang);
              
              const result = {
                ...barangItem,
                kategori_nama: barangItem.kategori?.nama_kategori || 'Tidak ada kategori',
                penitipan_info: {
                  id_penitipan: penitipanItem.id_penitipan,
                  tanggal_awal: penitipanItem.tanggal_awal_penitipan,
                  tanggal_akhir: penitipanItem.tanggal_akhir_penitipan,
                  nama_petugas_qc: penitipanItem.nama_petugas_qc
                }
              };
              
              return result;
            });
            
            console.log('Processed barang for this penitipan:', barangWithPenitipan.length);
            allBarang = [...allBarang, ...barangWithPenitipan];
          } else {
            console.log('No barang array found for penitipan:', penitipanItem.id_penitipan, 'or barang is not an array');
            console.log('Barang value:', penitipanItem.barang);
          }
        }
        
        console.log('Processed barang array:', allBarang);
        
        // Store the barang data
        console.log(`Setting ${allBarang.length} barang items in state`);
        setBarang(allBarang);
        
        // Log common issues
        if (allBarang.length === 0) {
          console.warn('No barang items found. Check the following:');
          console.warn('1. Are there any penitipan records?', penitipanData.length > 0);
          console.warn('2. Do any penitipan records have barang arrays?', 
            penitipanData.some(item => Array.isArray(item.barang) && item.barang.length > 0));
          console.warn('3. Check if the penitipan records contain the expected fields:',
            penitipanData.map(item => ({
              id: item.id_penitipan,
              hasBarangField: 'barang' in item,
              barangValue: item.barang
            }))
          );
        }
        
        // If we got penitipan data but no barang, something is wrong with the relationship
        if (penitipanData.length > 0 && allBarang.length === 0) {
          console.warn(`Found ${penitipanData.length} penitipan, but no barang items. There may be an issue with the data relationships.`);
          setDebug(`Found ${penitipanData.length} penitipan, but no barang items. There may be an issue with the data relationships.`);
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError(`Error API: ${apiError.message}`);
        setDebug(`API Error: ${apiError.message}`);
      }
      
    } catch (error) {
      console.error("General Error:", error);
      setError(`Gagal memuat data: ${error.message}`);
      setDebug(error.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenitipanData();
  }, [id_penitip, user?.id_user]);

  // Filter barang based on search input
  const filteredBarang = barang.filter(item => 
    item.nama_barang?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate dashboard statistics
  const getDashboardSummary = () => {
    // Use barang.length to get the actual number of items being displayed
    const totalBarang = barang.length;

    return (
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <FaCalendarAlt className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Barang Penitipan</h6>
                <h3 className="mb-0">{totalBarang}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  // Helper function to get status badge based on status_barang
  const getStatusBadge = (statusBarang) => {
    if (!statusBarang) return <Badge bg="secondary">Tidak Ada</Badge>;
    
    switch (statusBarang.toLowerCase()) {
      case 'tersedia':
        return <Badge bg="success">Tersedia</Badge>;
      case 'terjual':
        return <Badge bg="info">Terjual</Badge>;
      case 'donasi':
        return <Badge bg="primary">Donasi</Badge>;
      case 'tidak aktif':
        return <Badge bg="secondary">Tidak Aktif</Badge>;
      default:
        return <Badge bg="secondary">{statusBarang}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-0">Dashboard Penitip</h2>
                  {user && <p className="text-muted mb-0">{user.nama || ''}</p>}
                  
                  {/* Debug user data info */}
                  <div className="text-muted small mt-2">
                    <div>User ID: {user?.id_user || 'Not found'}</div>
                    <div>Penitip ID: {user?.id_penitip || 'Not found'}</div>
                    <div>Email: {user?.email || 'Not found'}</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Stats Section */}
          {!loading && !error && getDashboardSummary()}
          
          {/* Main Content */}
          {loading ? (
            <div className="text-center py-5">Memuat data...</div>
          ) : error ? (
            <>
              <Alert variant="danger" className="my-3">
                {error}
              </Alert>
              {debug && <Alert variant="info" className="my-3">Debug info: {debug}</Alert>}
            </>
          ) : (
            <>
              {/* Debug Info */}
              {debug && <Alert variant="info" className="mb-3">Debug info: {debug}</Alert>}
              
              {/* Search Bar */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-3">Cari Barang</h5>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Cari nama barang..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </InputGroup>
                </Card.Body>
              </Card>
              
              {/* Data Table */}
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white py-3">
                  <h5 className="mb-0">Daftar Barang Penitipan</h5>
                </Card.Header>
                <Card.Body>
                  {filteredBarang.length > 0 ? (
                    <Table responsive striped hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Nama Barang</th>
                          <th>Kategori</th>
                          <th>Mulai Penitipan</th>
                          <th>Akhir Penitipan</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBarang.map((item) => {
                          // Use status_barang from the model instead of calculating based on dates
                          const statusBarang = item.status_barang || 'Tidak Ada';
                          const tanggalAwal = new Date(item.penitipan_info.tanggal_awal);
                          const tanggalAkhir = new Date(item.penitipan_info.tanggal_akhir);
                          const now = new Date();
                          // Check if penitipan is still active (for extension button)
                          const penitipanActive = tanggalAkhir >= now;
                          
                          return (
                            <tr key={item.id_barang}>
                              <td>{item.nama_barang || 'Nama tidak tersedia'}</td>
                              <td>{item.kategori_nama || (item.kategori && item.kategori.nama_kategori) || 'Tidak ada kategori'}</td>
                              <td>{tanggalAwal.toLocaleDateString('id-ID')}</td>
                              <td>{tanggalAkhir.toLocaleDateString('id-ID')}</td>
                              <td>
                                {getStatusBadge(statusBarang)}
                              </td>
                              <td>
                                {penitipanActive && statusBarang.toLowerCase() !== 'terjual' && statusBarang.toLowerCase() !== 'donasi' ? (
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handlePerpanjangClick(item)}
                                    className="d-flex align-items-center"
                                  >
                                    <FaCalendarPlus className="me-1" /> Perpanjang
                                  </Button>
                                ) : (
                                  <Badge bg="secondary">
                                    {statusBarang.toLowerCase() === 'terjual' ? 'Terjual' : 
                                     statusBarang.toLowerCase() === 'donasi' ? 'Didonasikan' : 'Selesai'}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-0 text-muted">
                        {search 
                          ? 'Tidak ada barang yang sesuai dengan pencarian.' 
                          : penitipan.length > 0 
                            ? 'Anda memiliki penitipan tetapi tidak ada detail barang yang tersedia. Silakan hubungi administrator.' 
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

      {/* Extension Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Perpanjang Masa Penitipan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPenitipan && (
            <div>
              <p>Anda akan memperpanjang masa penitipan untuk barang:</p>
              <h5 className="my-3">{selectedPenitipan.nama_barang}</h5>
              
              <div className="mt-4">
                <h6>Masa Penitipan Saat Ini:</h6>
                <div className="row mb-3">
                  <div className="col-5">Tanggal Mulai:</div>
                  <div className="col-7 fw-bold">
                    {new Date(selectedPenitipan.penitipan_info.tanggal_awal).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5">Tanggal Akhir:</div>
                  <div className="col-7 fw-bold">
                    {new Date(selectedPenitipan.penitipan_info.tanggal_akhir).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6>Masa Penitipan Setelah Perpanjangan:</h6>
                <div className="row mb-3">
                  <div className="col-5">Tanggal Mulai Baru:</div>
                  <div className="col-7 fw-bold text-primary">
                    {new Date(selectedPenitipan.penitipan_info.tanggal_akhir).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5">Tanggal Akhir Baru:</div>
                  <div className="col-7 fw-bold text-primary">
                    {extendedEndDate && extendedEndDate.toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-5">Durasi Perpanjangan:</div>
                  <div className="col-7 fw-bold">30 hari</div>
                </div>
              </div>
              
              <Alert variant="info" className="mt-3">
                <small>
                  Perpanjangan akan menambah 30 hari pada masa penitipan Anda.
                  Masa awal penitipan baru akan dimulai dari tanggal akhir penitipan saat ini.
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleExtendSubmit} disabled={extendLoading}>
            {extendLoading ? 'Memproses...' : 'Perpanjang'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}
    </Container>
  );
};

export default DashboardPenitip;
