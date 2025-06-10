import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Alert, InputGroup, Button, Modal, Accordion } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaCalendarPlus, FaChevronDown, FaChevronUp, FaEye, FaHandPaper, FaCheck, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../api';
import { Link } from 'react-router-dom';
import PenitipSidebar from '../../components/PenitipSidebar';

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
  
  // Detail view state
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Extension modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendedEndDate, setExtendedEndDate] = useState(null);
  const [extendLoading, setExtendLoading] = useState(false);
  
  // Request Pengambilan state
  const [showRequestPengambilanModal, setShowRequestPengambilanModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [tanggalPengambilan, setTanggalPengambilan] = useState('');
  const [requestPengambilanLoading, setRequestPengambilanLoading] = useState(false);
  const [requestedBarangIds, setRequestedBarangIds] = useState([]);

  // Function to handle view details button click
  const handleViewDetails = (penitipanItem) => {
    setSelectedPenitipan(penitipanItem);
    setShowDetailModal(true);
  };

  // Function to check if any barang in the penitipan has been taken
  const hasAnyBarangTaken = (penitipanItem) => {
    if (!penitipanItem || !penitipanItem.barang || !Array.isArray(penitipanItem.barang)) {
      return false;
    }
    
    return penitipanItem.barang.some(barang => {
      const status = barang.status_barang?.toLowerCase() || '';
      return status.includes('diambil');
    });
  };

  // Function to handle perpanjang (extend) button click
  const handlePerpanjangClick = (item) => {
    // Check if the transaction is already completed
    if (isPenitipanSelesai(item)) {
      setError('Tidak dapat memperpanjang penitipan yang sudah selesai.');
      return;
    }
    
    // Calculate the new end date (30 days after current end date)
    const currentEndDate = new Date(item.tanggal_akhir_penitipan);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + 30);
    
    setSelectedPenitipan(item);
    setExtendedEndDate(newEndDate);
    setShowExtendModal(true);
  };

  // Function to submit the extension
  const handleExtendSubmit = async () => {
    if (!selectedPenitipan) return;
    
    setExtendLoading(true);
    
    try {
      // Current end date becomes the new start date
      const newStartDate = new Date(selectedPenitipan.tanggal_akhir_penitipan);
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
        `${BASE_URL}/api/penitipanBarang/${selectedPenitipan.id_penitipan}`,
        updateData
      );
      
      console.log('Extension response:', response.data);
      
      // Update the local data
      const updatedPenitipan = penitipan.map(item => {
        if (item.id_penitipan === selectedPenitipan.id_penitipan) {
          return {
            ...item,
            tanggal_awal_penitipan: formatDate(newStartDate),
            tanggal_akhir_penitipan: formatDate(newEndDate)
          };
        }
        return item;
      });
      
      // Update state
      setPenitipan(updatedPenitipan);
      setShowExtendModal(false);
      
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
    fetchPenitipanData();
    
    const user = getUserData();
    if (user && user.id_penitip) {
      fetchRequestPengambilanData(user.id_penitip);
    }
  }, [id_penitip, user?.id_user]);

  // Filter penitipan based on search input
  const filteredPenitipan = penitipan.filter(item => {
    const searchLower = search.toLowerCase();
    // Search by ID or date
    return item.id_penitipan.toString().includes(searchLower) || 
           (item.tanggal_awal_penitipan && item.tanggal_awal_penitipan.toLowerCase().includes(searchLower)) ||
           (item.tanggal_akhir_penitipan && item.tanggal_akhir_penitipan.toLowerCase().includes(searchLower));
  });

  // Calculate dashboard statistics
  const getDashboardSummary = () => {
    const totalPenitipan = penitipan.length;
    const barangCount = penitipan.reduce((total, item) => {
      return total + (Array.isArray(item.barang) ? item.barang.length : 0);
    }, 0);
    
    // Calculate active vs expired penitipan
    const now = new Date();
    const activePenitipan = penitipan.filter(item => {
      const endDate = new Date(item.tanggal_akhir_penitipan);
      return endDate >= now;
    }).length;

    return (
      <Row className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <FaCalendarAlt className="text-success" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Jumlah Penitipan</h6>
                <h3 className="mb-0">{activePenitipan}</h3>
              </div>
            </Card.Body>
          </Card>
      </Row>
    );
  };

  // Helper function to get status badge for penitipan
  const getPenitipanStatusBadge = (tanggalAkhir, penitipanItem) => {
    const now = new Date();
    const endDate = new Date(tanggalAkhir);
    
    // Check if end date is in the future (penitipan is still active date-wise)
    if (endDate >= now) {
      // If penitipan has items and we have the full penitipan object
      if (penitipanItem && penitipanItem.barang && Array.isArray(penitipanItem.barang)) {
        // Log status values for debugging
        console.log("Checking barang statuses for penitipan:", penitipanItem.id_penitipan);
        penitipanItem.barang.forEach(barang => {
          console.log(`Barang ${barang.id_barang} status: '${barang.status_barang}'`);
        });
        
        // Check if all items are "Habis"
        const allItemsHabis = penitipanItem.barang.length > 0 && penitipanItem.barang.every(barang => {
          const status = barang.status_barang || '';
          const statusLower = status.toLowerCase();
          return statusLower.includes('habis');
        });
        
        // If all items are "Habis", mark as "Selesai" even though date is still active
        if (allItemsHabis) {
          console.log(`Penitipan ${penitipanItem.id_penitipan} marked as Selesai because all items are Habis`);
          return <Badge bg="secondary">Selesai</Badge>;
        }
        
        // Check if all items are not active or have been processed (diambil, terjual, donasi)
        const allItemsProcessed = penitipanItem.barang.every(barang => {
          const status = barang.status_barang || '';
          const statusLower = status.toLowerCase();
          
          // Use the existing isStatusTidakAktif function for consistency
          return isStatusTidakAktif(status) || 
                 statusLower.includes('diambil') ||
                 statusLower.includes('terjual') ||
                 statusLower.includes('donasi') ||
                 statusLower.includes('habis');
        });
        
        // If all items are processed and there are items, mark as "Selesai" even though date is still active
        if (allItemsProcessed && penitipanItem.barang.length > 0) {
          return <Badge bg="secondary">Selesai</Badge>;
        }
      }
      
      // Default active status when date is in the future
      return <Badge bg="success">Aktif</Badge>;
    } else {
      // End date is in the past
      return <Badge bg="secondary">Selesai</Badge>;
    }
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

  // Helper function to get status badge based on status_barang
  const getBarangStatusBadge = (statusBarang) => {
    if (!statusBarang) return <Badge bg="secondary">Tidak Ada</Badge>;
    
    // Log the status for debugging
    console.log('Status barang (raw):', statusBarang);
    console.log('Status barang (normalized):', statusBarang.toString().toLowerCase().replace(/\s+/g, ''));
    
    const statusLower = statusBarang.toLowerCase();
    
    if (statusLower.includes('tersedia')) {
      return <Badge bg="success">Tersedia</Badge>;
    } else if (statusLower.includes('terjual')) {
      return <Badge bg="info">Terjual</Badge>;
    } else if (statusLower.includes('donasi')) {
      return <Badge bg="primary">Donasi</Badge>;
    } else if (statusLower.includes('habis')) {
      return <Badge bg="danger">Habis</Badge>;
    } else if (isStatusTidakAktif(statusBarang)) {
      return <Badge bg="secondary">Non Aktif</Badge>;
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

  // Function to handle Request Pengambilan button click
  const handleRequestPengambilan = (barang) => {
    setSelectedBarang(barang);
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

  // Helper function to check if a penitipan has "Selesai" status
  const isPenitipanSelesai = (penitipanItem) => {
    const now = new Date();
    const endDate = new Date(penitipanItem.tanggal_akhir_penitipan);
    
    // If end date is in the past, it's "Selesai"
    if (endDate < now) {
      return true;
    }
    
    // Check if all items are "Habis" or processed
    if (penitipanItem && penitipanItem.barang && Array.isArray(penitipanItem.barang) && penitipanItem.barang.length > 0) {
      // Check if all items are "Habis"
      const allItemsHabis = penitipanItem.barang.every(barang => {
        const status = barang.status_barang || '';
        const statusLower = status.toLowerCase();
        return statusLower.includes('habis');
      });
      
      if (allItemsHabis) {
        return true;
      }
      
      // Check if all items are processed (diambil, terjual, donasi, tidak aktif)
      const allItemsProcessed = penitipanItem.barang.every(barang => {
        const status = barang.status_barang || '';
        const statusLower = status.toLowerCase();
        
        return isStatusTidakAktif(status) || 
               statusLower.includes('diambil') ||
               statusLower.includes('terjual') ||
               statusLower.includes('donasi') ||
               statusLower.includes('habis');
      });
      
      if (allItemsProcessed) {
        return true;
      }
    }
    
    return false;
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
                    <h2 className="mb-0 text-success">Dashboard Penitip</h2>
                    {user && <p className="text-muted mb-0">{user.nama || ''}</p>}
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

                {/* Success Message */}
                {successMessage && (
                  <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}
                
                {/* Data Table */}
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-success text-white py-3">
                    <h5 className="mb-0">Daftar Penitipan Barang</h5>
                  </Card.Header>
                  <Card.Body>
                    {filteredPenitipan.length > 0 ? (
                      <Table responsive striped hover className="mb-0">
                        <thead>
                          <tr>
                            <th>Tanggal Mulai</th>
                            <th>Tanggal Berakhir</th>
                            <th>Status</th>
                            <th>Jumlah Barang</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPenitipan.map((item) => {
                            const now = new Date();
                            const tanggalAwal = new Date(item.tanggal_awal_penitipan);
                            const tanggalAkhir = new Date(item.tanggal_akhir_penitipan);
                            const isActive = tanggalAkhir >= now;
                            const barangCount = Array.isArray(item.barang) ? item.barang.length : 0;
                            
                            return (
                              <tr key={item.id_penitipan}>
                                <td>{formatDate(item.tanggal_awal_penitipan)}</td>
                                <td>{formatDate(item.tanggal_akhir_penitipan)}</td>
                                <td>{getPenitipanStatusBadge(item.tanggal_akhir_penitipan, item)}</td>
                                <td>{barangCount}</td>
                                <td className="d-flex">
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleViewDetails(item)}
                                  >
                                    <FaEye className="me-1" /> Detail
                                  </Button>
                                  
                                  {isActive && !hasAnyBarangTaken(item) && !isPenitipanSelesai(item) && (
                                    <Button 
                                      variant="success" 
                                      size="sm"
                                      onClick={() => handlePerpanjangClick(item)}
                                    >
                                      <FaCalendarPlus className="me-1" /> Perpanjang
                                    </Button>
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
                            ? 'Tidak ada penitipan yang sesuai dengan pencarian.' 
                            : 'Belum ada penitipan barang.'}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}
          </Col>
        </Row>

        {/* Penitipan Detail Modal */}
        <Modal 
          show={showDetailModal} 
          onHide={() => setShowDetailModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>Detail Penitipan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPenitipan && (
              <>
                <div className="mb-4">
                  <h6 className="text-success mb-3">Informasi Penitipan</h6>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <td className="bg-light">Tanggal Mulai</td>
                        <td>{formatDate(selectedPenitipan.tanggal_awal_penitipan)}</td>
                      </tr>
                      <tr>
                        <td className="bg-light">Tanggal Berakhir</td>
                        <td>{formatDate(selectedPenitipan.tanggal_akhir_penitipan)}</td>
                      </tr>
                      <tr>
                        <td className="bg-light">Petugas QC</td>
                        <td>{selectedPenitipan.nama_petugas_qc || 'Tidak tersedia'}</td>
                      </tr>
                      <tr>
                        <td className="bg-light">Status</td>
                        <td>{getPenitipanStatusBadge(selectedPenitipan.tanggal_akhir_penitipan, selectedPenitipan)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                
                <h6 className="text-success mb-3">Daftar Barang ({selectedPenitipan.barang?.length || 0})</h6>
                
                {selectedPenitipan.barang && selectedPenitipan.barang.length > 0 ? (
                  <Table responsive striped bordered hover>
                    <thead className="bg-success text-white">
                      <tr>
                        <th>Nama Barang</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Status</th>
                        {/* <th>Aksi</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPenitipan.barang.map((barang) => {
                        // Log each barang status for debugging
                        console.log(`Barang ${barang.id_barang} status:`, barang.status_barang);
                        const showRequestButton = isStatusTidakAktif(barang.status_barang);
                        const isAlreadyRequested = requestedBarangIds.includes(barang.id_barang);
                        console.log(`Show request button for barang ${barang.id_barang}:`, showRequestButton);
                        console.log(`Barang ${barang.id_barang} already requested:`, isAlreadyRequested);
                        
                        return (
                          <tr key={barang.id_barang}>
                            <td>{barang.nama_barang}</td>
                            <td>{barang.kategori?.nama_kategori || 'Tidak ada kategori'}</td>
                            <td>Rp {barang.harga?.toLocaleString() || '0'}</td>
                            <td>{getBarangStatusBadge(barang.status_barang)}</td>
                            {/* <td>                           
                            </td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">
                    Tidak ada data barang untuk penitipan ini.
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Extension Modal */}
        <Modal show={showExtendModal} onHide={() => setShowExtendModal(false)}>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>Perpanjang Masa Penitipan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPenitipan && (
              <div>
                <p>Anda akan memperpanjang masa penitipan</p>
                
                <div className="mt-4">
                  <h6>Masa Penitipan Saat Ini:</h6>
                  <div className="row mb-3">
                    <div className="col-5">Tanggal Mulai:</div>
                    <div className="col-7 fw-bold">
                      {formatDate(selectedPenitipan.tanggal_awal_penitipan)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-5">Tanggal Akhir:</div>
                    <div className="col-7 fw-bold">
                      {formatDate(selectedPenitipan.tanggal_akhir_penitipan)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>Masa Penitipan Setelah Perpanjangan:</h6>
                  <div className="row mb-3">
                    <div className="col-5">Tanggal Mulai Baru:</div>
                    <div className="col-7 fw-bold text-success">
                      {formatDate(selectedPenitipan.tanggal_akhir_penitipan)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-5">Tanggal Akhir Baru:</div>
                    <div className="col-7 fw-bold text-success">
                      {extendedEndDate && formatDate(extendedEndDate)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-5">Durasi Perpanjangan:</div>
                    <div className="col-7 fw-bold">30 hari</div>
                  </div>
                </div>
                
                <Alert variant="success" className="mt-3">
                  <small>
                    Perpanjangan akan menambah 30 hari pada masa penitipan Anda.
                    Masa awal penitipan baru akan dimulai dari tanggal akhir penitipan saat ini.
                  </small>
                </Alert>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowExtendModal(false)}>
              Batal
            </Button>
            <Button variant="success" onClick={handleExtendSubmit} disabled={extendLoading}>
              {extendLoading ? 'Memproses...' : 'Perpanjang'}
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
                      <td>{selectedBarang.kategori?.nama_kategori || 'Tidak ada kategori'}</td>
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
                    Request pengambilan akan diproses oleh admin. Anda akan dihubungi 
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
      </Container>
    </div>
  );
};

export default DashboardPenitip;
