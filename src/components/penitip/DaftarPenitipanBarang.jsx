import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaEye, FaCalendarPlus, FaSearch } from 'react-icons/fa';
import { getPenitipanByPenitipId } from '../../api/PenitipanBarangApi';

const DaftarPenitipanBarang = ({ idPenitip }) => {
  const [penitipan, setPenitipan] = useState([]);
  const [filteredPenitipan, setFilteredPenitipan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    status: '',
    namaBarang: ''
  });

  useEffect(() => {
    if (!idPenitip) {
      setError("ID penitip tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchPenitipanData();
  }, [idPenitip]);

  // Apply filters whenever penitipan data or filters change
  useEffect(() => {
    applyFilters();
  }, [penitipan, filters]);

  // Function to fetch penitipan data
  const fetchPenitipanData = async () => {
    try {
      setLoading(true);
      console.log(`Attempting to fetch data for penitip with ID: ${idPenitip}`);
      
      // Menggunakan API getPenitipanByPenitipId
      const response = await getPenitipanByPenitipId(idPenitip);
      console.log('API Response:', response);
      
      if (!response) {
        throw new Error('Tidak ada data yang diterima dari server');
      }
      
      // Check for success flag in new response format
      if (response.success === false) {
        throw new Error(response.message || 'Terjadi kesalahan pada server');
      }
      
      // Handle new response format
      const penitipanData = response.data || response;
      
      if (!Array.isArray(penitipanData)) {
        throw new Error('Format data dari server tidak sesuai');
      }

      console.log(`Received ${penitipanData.length} penitipan records`);
      setPenitipan(penitipanData);
      setFilteredPenitipan(penitipanData);
      
    } catch (error) {
      console.error("Error fetching penitipan data:", error);
      setError(`Gagal memuat data: ${error.message}`);
      setDebug(error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to apply filters to penitipan data
  const applyFilters = () => {
    let filtered = [...penitipan];
    
    // Filter by start date if provided
    if (filters.startDate) {
      const filterDate = new Date(filters.startDate);
      filterDate.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
      
      filtered = filtered.filter(item => {
        const startDate = new Date(item.tanggal_awal_penitipan);
        startDate.setHours(0, 0, 0, 0);
        return startDate.getTime() === filterDate.getTime();
      });
    }
    
    // Filter by status if selected
    if (filters.status) {
      const now = new Date();
      
      filtered = filtered.filter(item => {
        const endDate = new Date(item.tanggal_akhir_penitipan);
        
        if (filters.status === 'aktif') {
          // For "Aktif" status, filter items where end date is in the future
          // and not all items have "Habis" status
          return endDate >= now && !isPenitipanSelesai(item);
        } else if (filters.status === 'selesai') {
          // For "Selesai" status, filter items where end date is in the past
          // or all items have "Habis" status
          return endDate < now || isPenitipanSelesai(item);
        }
        
        // Return all if status filter doesn't match known values
        return true;
      });
    }
    
    // Filter by product name if provided
    if (filters.namaBarang && filters.namaBarang.trim() !== '') {
      const searchTerm = filters.namaBarang.toLowerCase().trim();
      
      filtered = filtered.filter(item => {
        // Check if item has barang array and at least one barang matches the search term
        return item.barang && Array.isArray(item.barang) && item.barang.some(barang => 
          barang.nama_barang && barang.nama_barang.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    setFilteredPenitipan(filtered);
  };

  // Function to reset filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      status: '',
      namaBarang: ''
    });
  };

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

  // Helper function to get status badge for penitipan
  const getPenitipanStatusBadge = (tanggalAkhir, penitipanItem) => {
    const now = new Date();
    const endDate = new Date(tanggalAkhir);
    
    // Check if end date is in the future (penitipan is still active date-wise)
    if (endDate >= now) {
      // If penitipan has items and we have the full penitipan object
      if (penitipanItem && penitipanItem.barang && Array.isArray(penitipanItem.barang)) {
        // Check if all items are "Habis"
        const allItemsHabis = penitipanItem.barang.length > 0 && penitipanItem.barang.every(barang => {
          const status = barang.status_barang || '';
          const statusLower = status.toLowerCase();
          return statusLower.includes('habis');
        });
        
        // If all items are "Habis", mark as "Selesai" even though date is still active
        if (allItemsHabis) {
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

  // Calculate dashboard statistics
  const getDashboardSummary = () => {
    // Calculate active vs expired penitipan
    const now = new Date();
    const activePenitipan = filteredPenitipan.filter(item => {
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

  if (loading) {
    return <div className="text-center py-5">Memuat data penitipan...</div>;
  }

  if (error) {
    return (
      <>
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
        {debug && <Alert variant="info" className="my-3">Debug info: {debug}</Alert>}
      </>
    );
  }

  return (
    <>
      {/* Stats Section */}
      {getDashboardSummary()}
      
      {/* Search and Filter Section */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0"><FaSearch className="me-2" /> Cari Penitipan</h6>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Mulai</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Barang</Form.Label>
                  <Form.Control
                    type="text"
                    name="namaBarang"
                    value={filters.namaBarang}
                    onChange={handleFilterChange}
                    placeholder="Cari berdasarkan nama barang"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={resetFilters}
                >
                  Reset Filter
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="mb-0 text-muted">Tidak ada data penitipan yang sesuai dengan filter.</p>
            </div>
          )}
        </Card.Body>
      </Card>

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
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPenitipan.barang.map((barang) => (
                      <tr key={barang.id_barang}>
                        <td>{barang.nama_barang}</td>
                        <td>{barang.kategori?.nama_kategori || 'Tidak ada kategori'}</td>
                        <td>Rp {barang.harga?.toLocaleString() || '0'}</td>
                        <td>{getBarangStatusBadge(barang.status_barang)}</td>
                      </tr>
                    ))}
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
    </>
  );
};

export default DaftarPenitipanBarang; 