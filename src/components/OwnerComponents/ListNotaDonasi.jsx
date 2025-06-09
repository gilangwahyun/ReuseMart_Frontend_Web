import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Form, Button, Card, Container, Badge, Spinner, Alert } from 'react-bootstrap';
import { getAllDonatedItemsWithAllocations, searchDonatedItemsByName } from '../../api/BarangDonasiApi';
import { format } from 'date-fns';

const ListNotaDonasi = () => {
  const [donatedItems, setDonatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDonatedItems();
  }, []);

  const fetchDonatedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDonatedItemsWithAllocations();
      console.log("Fetched donated items:", data);
      setDonatedItems(data || []);
    } catch (err) {
      console.error("Error fetching donated items:", err);
      setError("Gagal memuat data barang yang sudah didonasikan");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      return fetchDonatedItems();
    }
    
    try {
      setLoading(true);
      const data = await searchDonatedItemsByName(searchKeyword);
      setDonatedItems(data || []);
    } catch (err) {
      console.error("Error searching donated items:", err);
      setError("Pencarian barang donasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAll = () => {
    // Navigate to the comprehensive report page
    navigate('/owner/nota-donasi/print-all');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Group items by organization
  const getOrganizationCount = () => {
    const organizations = new Set();
    donatedItems.forEach(item => {
      if (item.alokasiDonasi?.requestDonasi?.organisasi?.nama_organisasi) {
        organizations.add(item.alokasiDonasi.requestDonasi.organisasi.nama_organisasi);
      }
    });
    return organizations.size;
  };

  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Daftar Barang yang Sudah Didonasikan</h4>
      
      {statusMessage && (
        <Alert 
          variant={statusMessage.type} 
          onClose={() => setStatusMessage(null)} 
          dismissible
          className="mb-3"
        >
          {statusMessage.text}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <Form className="d-flex flex-grow-1">
            <Form.Group className="me-2 flex-grow-1">
              <Form.Control
                type="text"
                placeholder="Cari barang donasi berdasarkan nama"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSearch}>Cari</Button>
            <Button variant="secondary" className="ms-2" onClick={fetchDonatedItems}>Reset</Button>
          </Form>
          
          <Button 
            variant="success" 
            className="ms-3"
            onClick={handlePrintAll}
            disabled={donatedItems.length === 0}
          >
            Cetak Laporan Donasi
          </Button>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Memuat data barang donasi...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="mb-3">
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Total {donatedItems.length} barang telah didonasikan kepada {getOrganizationCount()} organisasi
            </Alert>
          </div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID Barang</th>
                <th>Nama Barang</th>
                <th>Penitip</th>
                <th>Harga</th>
                <th>Penerima Donasi</th>
                <th>Tanggal Donasi</th>
              </tr>
            </thead>
            <tbody>
              {donatedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Tidak ada data barang donasi</td>
                </tr>
              ) : (
                donatedItems.map((item) => (
                  <tr key={item.id_barang}>
                    <td>{item.id_barang}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.penitipan_barang?.penitip?.nama_penitip || 'Tidak ada data'}</td>
                    <td>{formatRupiah(item.harga || 0)}</td>
                    <td>
                      {item.alokasi_donasi?.request_donasi?.organisasi?.nama_organisasi || 'Tidak ada data'}
                    </td>
                    <td>
                      {item.alokasi_donasi?.tanggal_donasi 
                        ? formatDate(item.alokasi_donasi.tanggal_donasi)
                        : 'Tidak ada data'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default ListNotaDonasi; 