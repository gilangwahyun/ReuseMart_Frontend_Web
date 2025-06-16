import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FaHandPaper, FaEye, FaTimes } from 'react-icons/fa';
import { getRequestPengambilanByPenitip, createRequestPengambilan, cancelRequestPengambilan } from '../../api/RequestPengambilanApi';
import { getPenitipanByPenitipId } from '../../api/PenitipanBarangApi';

const RequestPengambilanBarang = ({ idPenitip }) => {
  const [barang, setBarang] = useState([]);
  const [requestedBarangIds, setRequestedBarangIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Request Pengambilan state
  const [showRequestPengambilanModal, setShowRequestPengambilanModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [tanggalPengambilan, setTanggalPengambilan] = useState('');
  const [requestPengambilanLoading, setRequestPengambilanLoading] = useState(false);

  // Detail view state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!idPenitip) {
      setError("ID penitip tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [idPenitip]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch penitipan data to get all barang
      const penitipanResponse = await getPenitipanByPenitipId(idPenitip);
      const penitipanData = penitipanResponse.data || penitipanResponse;
      
      if (!Array.isArray(penitipanData)) {
        throw new Error('Format data penitipan tidak sesuai');
      }
      
      // Collect all barang from each penitipan
      let allBarang = [];
      for (const penitipanItem of penitipanData) {
        if (penitipanItem.barang && Array.isArray(penitipanItem.barang)) {
          // Add penitipan data to each barang for reference
          const barangWithPenitipan = penitipanItem.barang.map(barangItem => ({
            ...barangItem,
            kategori_nama: barangItem.kategori?.nama_kategori || 'Tidak ada kategori',
            penitipan_info: {
              id_penitipan: penitipanItem.id_penitipan,
              tanggal_awal: penitipanItem.tanggal_awal_penitipan,
              tanggal_akhir: penitipanItem.tanggal_akhir_penitipan,
              nama_petugas_qc: penitipanItem.nama_petugas_qc
            }
          }));
          
          allBarang = [...allBarang, ...barangWithPenitipan];
        }
      }
      
      setBarang(allBarang);
      
      // Fetch request pengambilan data
      const requestsResponse = await getRequestPengambilanByPenitip(idPenitip);
      console.log('Request pengambilan data:', requestsResponse);
      
      // Extract the IDs of requested barang
      const requestedIds = requestsResponse.map(req => req.id_barang);
      console.log('Requested barang IDs:', requestedIds);
      
      setRequestedBarangIds(requestedIds);
      setRequests(requestsResponse);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
      const requestData = {
        id_penitip: idPenitip,
        id_barang: selectedBarang.id_barang,
        tanggal_pengambilan: tanggalPengambilan,
      };
      
      console.log('Sending request pengambilan data:', requestData);
      
      // Menggunakan API createRequestPengambilan
      const response = await createRequestPengambilan(requestData);
      
      console.log('Request pengambilan response:', response);
      
      // Add the barang ID to the list of requested items
      setRequestedBarangIds(prev => [...prev, selectedBarang.id_barang]);
      
      // Update state and show success message
      setShowRequestPengambilanModal(false);
      setSuccessMessage('Request pengambilan barang berhasil dikirim!');
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error submitting request pengambilan:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError('Gagal mengirim request pengambilan: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'));
    } finally {
      setRequestPengambilanLoading(false);
    }
  };

  // Function to handle cancel request
  const handleCancelRequest = async (requestId) => {
    try {
      await cancelRequestPengambilan(requestId);
      setSuccessMessage('Request pengambilan berhasil dibatalkan');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError('Gagal membatalkan request: ' + (error.message || 'Terjadi kesalahan'));
    }
  };

  // Function to view request details
  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
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

  // Get request status badge
  const getRequestStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Tidak Ada Status</Badge>;
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('pending') || statusLower.includes('menunggu')) {
      return <Badge bg="warning">Menunggu Persetujuan</Badge>;
    } else if (statusLower.includes('disetujui') || statusLower.includes('approved')) {
      return <Badge bg="success">Disetujui</Badge>;
    } else if (statusLower.includes('ditolak') || statusLower.includes('rejected')) {
      return <Badge bg="danger">Ditolak</Badge>;
    } else if (statusLower.includes('selesai') || statusLower.includes('completed')) {
      return <Badge bg="info">Selesai</Badge>;
    } else {
      return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-5">Memuat data request pengambilan...</div>;
  }

  return (
    <>
      {/* Error message */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      {/* Request Pengambilan List */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-success text-white py-3">
          <h5 className="mb-0">Daftar Request Pengambilan</h5>
        </Card.Header>
        <Card.Body>
          {requests.length > 0 ? (
            <Table responsive striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Tanggal Request</th>
                  <th>Tanggal Pengambilan</th>
                  <th>Nama Barang</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const barangInfo = barang.find(b => b.id_barang === request.id_barang) || {};
                  
                  return (
                    <tr key={request.id_request_pengambilan}>
                      <td>{formatDate(request.created_at)}</td>
                      <td>{formatDate(request.tanggal_pengambilan)}</td>
                      <td>{barangInfo.nama_barang || 'Barang tidak ditemukan'}</td>
                      <td>{getRequestStatusBadge(request.status)}</td>
                      <td>
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewRequestDetails(request)}
                        >
                          <FaEye /> Detail
                        </Button>
                        {(request.status === 'pending' || request.status === 'menunggu') && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelRequest(request.id_request_pengambilan)}
                          >
                            <FaTimes /> Batalkan
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
              <p className="mb-0 text-muted">Belum ada request pengambilan barang.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Barang yang dapat diambil */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-success text-white py-3">
          <h5 className="mb-0">Barang yang Dapat Diambil</h5>
        </Card.Header>
        <Card.Body>
          {barang.filter(item => isStatusTidakAktif(item.status_barang) && !requestedBarangIds.includes(item.id_barang)).length > 0 ? (
            <Table responsive striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {barang
                  .filter(item => isStatusTidakAktif(item.status_barang) && !requestedBarangIds.includes(item.id_barang))
                  .map((item) => (
                    <tr key={item.id_barang}>
                      <td>{item.nama_barang}</td>
                      <td>{item.kategori_nama}</td>
                      <td>{getBarangStatusBadge(item.status_barang)}</td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleRequestPengambilan(item)}
                        >
                          <FaHandPaper className="me-1" /> Request Pengambilan
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="mb-0 text-muted">Tidak ada barang yang dapat diambil saat ini.</p>
            </div>
          )}
        </Card.Body>
      </Card>

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
                    <td>{selectedBarang.kategori_nama}</td>
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

      {/* Request Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Detail Request Pengambilan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="bg-light" width="40%">ID Request</td>
                    <td>{selectedRequest.id_request_pengambilan}</td>
                  </tr>
                  <tr>
                    <td className="bg-light">Tanggal Request</td>
                    <td>{formatDate(selectedRequest.created_at)}</td>
                  </tr>
                  <tr>
                    <td className="bg-light">Tanggal Pengambilan</td>
                    <td>{formatDate(selectedRequest.tanggal_pengambilan)}</td>
                  </tr>
                  <tr>
                    <td className="bg-light">Status</td>
                    <td>{getRequestStatusBadge(selectedRequest.status)}</td>
                  </tr>
                  <tr>
                    <td className="bg-light">Barang</td>
                    <td>
                      {barang.find(b => b.id_barang === selectedRequest.id_barang)?.nama_barang || 
                       'Barang tidak ditemukan'}
                    </td>
                  </tr>
                  {selectedRequest.catatan && (
                    <tr>
                      <td className="bg-light">Catatan</td>
                      <td>{selectedRequest.catatan}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              <Alert variant="info" className="mt-3">
                {selectedRequest.status === 'pending' || selectedRequest.status === 'menunggu' ? (
                  <p className="mb-0">Request pengambilan Anda sedang menunggu persetujuan admin.</p>
                ) : selectedRequest.status === 'disetujui' || selectedRequest.status === 'approved' ? (
                  <p className="mb-0">Request pengambilan Anda telah disetujui. Silakan ambil barang pada tanggal yang ditentukan.</p>
                ) : selectedRequest.status === 'ditolak' || selectedRequest.status === 'rejected' ? (
                  <p className="mb-0">Request pengambilan Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.</p>
                ) : selectedRequest.status === 'selesai' || selectedRequest.status === 'completed' ? (
                  <p className="mb-0">Request pengambilan Anda telah selesai. Barang telah diambil.</p>
                ) : (
                  <p className="mb-0">Status request pengambilan: {selectedRequest.status}</p>
                )}
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
          {selectedRequest && (selectedRequest.status === 'pending' || selectedRequest.status === 'menunggu') && (
            <Button 
              variant="danger" 
              onClick={() => {
                handleCancelRequest(selectedRequest.id_request_pengambilan);
                setShowDetailModal(false);
              }}
            >
              Batalkan Request
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RequestPengambilanBarang; 