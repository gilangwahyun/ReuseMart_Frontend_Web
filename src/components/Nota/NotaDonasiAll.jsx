import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { getAllDonatedItemsWithAllocations } from '../../api/BarangDonasiApi';

const NotaDonasiAll = () => {
  const [donatedItems, setDonatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printComponentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonatedItems();
  }, []);

  const fetchDonatedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDonatedItemsWithAllocations();
      setDonatedItems(data || []);
    } catch (err) {
      console.error("Error fetching donated items:", err);
      setError("Gagal memuat data barang yang sudah didonasikan");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    contentRef: printComponentRef,
    documentTitle: 'Laporan Donasi Barang ReuseMart',
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
    navigate('/owner/nota-donasi');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
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
  const getOrganizedDonations = () => {
    const organizationMap = new Map();
    
    donatedItems.forEach(item => {
      if (item.alokasiDonasi?.requestDonasi?.organisasi) {
        const orgId = item.alokasiDonasi.requestDonasi.organisasi.id_organisasi;
        const orgName = item.alokasiDonasi.requestDonasi.organisasi.nama_organisasi;
        
        if (!organizationMap.has(orgId)) {
          organizationMap.set(orgId, {
            id: orgId,
            name: orgName,
            items: [],
            totalValue: 0
          });
        }
        
        organizationMap.get(orgId).items.push(item);
        organizationMap.get(orgId).totalValue += (item.harga || 0);
      } else {
        // For items without organization data
        if (!organizationMap.has('unknown')) {
          organizationMap.set('unknown', {
            id: 'unknown',
            name: 'Tidak Tercatat',
            items: [],
            totalValue: 0
          });
        }
        
        organizationMap.get('unknown').items.push(item);
        organizationMap.get('unknown').totalValue += (item.harga || 0);
      }
    });
    
    return Array.from(organizationMap.values());
  };

  const getTotalDonationValue = () => {
    return donatedItems.reduce((sum, item) => sum + (item.harga || 0), 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Memuat data nota donasi...</span>
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

  const organizedDonations = getOrganizedDonations();
  
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
      <div ref={printComponentRef} className="p-3" style={{ width: '100%', minHeight: '500px' }}>
        <Card className="p-4 mb-4">
          <Card.Body>
            <div className="text-center mb-4">
              <h2>LAPORAN DONASI BARANG</h2>
              <h4>ReuseMart</h4>
              <p className="text-muted">Pusat Daur Ulang dan Donasi Barang Bekas</p>
              <p>Tanggal Cetak: {formatDate(new Date())}</p>
            </div>

            {organizedDonations.map((org, index) => (
              <Card className="mb-4" key={org.id}>
                <Card.Body>
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>ID Barang</th>
                        <th>Nama Barang</th>
                        <th>ID Penitip</th>
                        <th>Nama Penitip</th>
                        <th>Tgl. Donasi</th>
                        <th>Organisasi</th>
                        <th>Penerima</th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.items.map((item, idx) => (
                        <tr key={item.id_barang}>
                          <td>{idx + 1}</td>
                          <td>{item.id_barang}</td>
                          <td>{item.nama_barang}</td>
                          <td>{item.penitipan_barang?.penitip?.id_penitip || 'Tidak ada data'}</td>
                          <td>{item.penitipan_barang?.penitip?.nama_penitip || 'Tidak ada data'}</td>
                          <td>
                            {item.alokasi_donasi?.tanggal_donasi
                              ? formatDate(item.alokasi_donasi.tanggal_donasi)
                              : 'Belum diserahkan'}
                          </td>
                          <td>{item.alokasi_donasi?.request_donasi?.organisasi?.nama_organisasi || 'Belum diserahkan'}</td>
                          <td>{item.alokasi_donasi?.nama_penerima || 'Belum diserahkan'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))}

            <div className="mt-5 pt-5">
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>Manajer ReuseMart</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <p>Membuat Laporan,</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>Admin Donasi</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default NotaDonasiAll; 