import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Button, Modal } from 'react-bootstrap';
import { FaCalendarPlus, FaEye } from 'react-icons/fa';
import { getPenitipanByPenitipId, extendPenitipanBarang } from '../../api/PenitipanBarangApi';

const RequestPerpanjanganPenitipan = ({ idPenitip }) => {
  const [penitipan, setPenitipan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Extension modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [extendedEndDate, setExtendedEndDate] = useState(null);
  const [extendLoading, setExtendLoading] = useState(false);

  useEffect(() => {
    if (!idPenitip) {
      setError("ID penitip tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchPenitipanData();
  }, [idPenitip]);

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
      
    } catch (error) {
      console.error("Error fetching penitipan data:", error);
      setError(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
      
      // Menggunakan API extendPenitipanBarang
      const response = await extendPenitipanBarang(selectedPenitipan.id_penitipan, updateData);
      
      console.log('Extension response:', response);
      
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining for a penitipan
  const calculateDaysRemaining = (endDateString) => {
    const now = new Date();
    const endDate = new Date(endDateString);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="text-center py-5">Memuat data penitipan...</div>;
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        {error}
      </Alert>
    );
  }

  // Filter active penitipan that can be extended
  const activePenitipan = penitipan.filter(item => {
    const endDate = new Date(item.tanggal_akhir_penitipan);
    const now = new Date();
    return endDate >= now && !isPenitipanSelesai(item) && !hasAnyBarangTaken(item);
  });

  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      {/* Data Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-success text-white py-3">
          <h5 className="mb-0">Penitipan yang Dapat Diperpanjang</h5>
        </Card.Header>
        <Card.Body>
          {activePenitipan.length > 0 ? (
            <Table responsive striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Berakhir</th>
                  <th>Sisa Hari</th>
                  <th>Status</th>
                  <th>Jumlah Barang</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activePenitipan.map((item) => {
                  const daysRemaining = calculateDaysRemaining(item.tanggal_akhir_penitipan);
                  const barangCount = Array.isArray(item.barang) ? item.barang.length : 0;
                  
                  return (
                    <tr key={item.id_penitipan}>
                      <td>{formatDate(item.tanggal_awal_penitipan)}</td>
                      <td>{formatDate(item.tanggal_akhir_penitipan)}</td>
                      <td>
                        {daysRemaining <= 0 ? (
                          <Badge bg="danger">Kadaluarsa</Badge>
                        ) : daysRemaining <= 7 ? (
                          <Badge bg="warning">{daysRemaining} hari</Badge>
                        ) : (
                          <Badge bg="success">{daysRemaining} hari</Badge>
                        )}
                      </td>
                      <td>{getPenitipanStatusBadge(item.tanggal_akhir_penitipan, item)}</td>
                      <td>{barangCount}</td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handlePerpanjangClick(item)}
                        >
                          <FaCalendarPlus className="me-1" /> Perpanjang
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="mb-0 text-muted">Tidak ada penitipan yang dapat diperpanjang saat ini.</p>
            </div>
          )}
        </Card.Body>
      </Card>

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
    </>
  );
};

export default RequestPerpanjanganPenitipan; 