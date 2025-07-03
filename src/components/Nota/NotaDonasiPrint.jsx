import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Row, Col, Spinner } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import useAxios from '../../api';

const NotaDonasiPrint = () => {
  const { id_alokasi } = useParams();
  const [alokasi, setAlokasi] = useState(null);
  const [barang, setBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printComponentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get alokasi data
        const alokasiResponse = await useAxios.get(`/alokasiDonasi/${id_alokasi}`);
        setAlokasi(alokasiResponse.data);
        
        // If alokasi has barang data, get detailed barang info
        if (alokasiResponse.data?.id_barang) {
          const barangResponse = await useAxios.get(`/barang/${alokasiResponse.data.id_barang}`);
          setBarang(barangResponse.data);
          console.log("Barang data:", barangResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data nota donasi");
      } finally {
        setLoading(false);
      }
    };

    if (id_alokasi) {
      fetchData();
    }
  }, [id_alokasi]);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    contentRef: printComponentRef,
    documentTitle: `Nota Donasi - ${id_alokasi || ''}`,
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Memuat data nota...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          {error}
          <div className="mt-3">
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!alokasi) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Data alokasi tidak ditemukan.
          <div className="mt-3">
            <Button variant="secondary" onClick={handleBack}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), 'dd MMMM yyyy');
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container py-4">
      <div className="mb-3 d-print-none">
        <Button variant="secondary" onClick={handleBack} className="me-2">
          &laquo; Kembali
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          Cetak Nota
        </Button>
      </div>

      <div ref={printComponentRef} className="p-4" style={{ width: '100%', minHeight: '500px' }}>
        <Card className="p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card.Body>
            <div className="text-center mb-4">
              <h3>NOTA ALOKASI DONASI</h3>
              <h5>ReuseMart</h5>
              <p className="text-muted">Pusat Daur Ulang dan Donasi Barang Bekas</p>
              <p>Tanggal Cetak: {formatDate(new Date())}</p>
            </div>

            <Row className="mb-3">
              <Col md={6}>
                <p className="mb-1"><strong>ID Alokasi:</strong> {alokasi.id_alokasi_donasi}</p>
                <p className="mb-1"><strong>ID Request Donasi:</strong> {alokasi.id_request_donasi}</p>
                <p className="mb-1"><strong>Tanggal Donasi:</strong> {alokasi.tanggal_donasi 
                  ? formatDate(alokasi.tanggal_donasi)
                  : 'Belum diserahkan'}</p>
              </Col>
              <Col md={6}>
                <p className="mb-1"><strong>Organisasi:</strong> {alokasi.requestDonasi?.organisasi?.nama_organisasi || 'Tidak ada data'}</p>
                <p className="mb-1"><strong>Penerima:</strong> {alokasi.nama_penerima || 'Belum diserahkan'}</p>
                <p className="mb-1">
                  <strong>Status:</strong> {alokasi.tanggal_donasi && alokasi.nama_penerima ? 
                    'Sudah diserahkan' : 'Belum diserahkan'}
                </p>
              </Col>
            </Row>

            <hr />

            <h5 className="mb-3">Detail Barang</h5>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>ID Barang</th>
                  <th>Nama Barang</th>
                  <th>ID Penitip</th>
                  <th>Nama Penitip</th>
                  <th>Organisasi</th>
                  <th>Penerima</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{barang?.id_barang || alokasi.barang?.id_barang || 'Tidak ada data'}</td>
                  <td>{barang?.nama_barang || alokasi.barang?.nama_barang || 'Tidak ada data'}</td>
                  <td>{barang?.penitipanBarang?.penitip?.id_penitip || barang?.penitipan_barang?.penitip?.id_penitip || 'Tidak ada data'}</td>
                  <td>{barang?.penitipanBarang?.penitip?.nama_penitip || barang?.penitipan_barang?.penitip?.nama_penitip || 'Tidak ada data'}</td>
                  <td>{alokasi.requestDonasi?.organisasi?.nama_organisasi || 'Tidak ada data'}</td>
                  <td>{alokasi.nama_penerima || 'Belum diserahkan'}</td>
                </tr>
              </tbody>
            </Table>
            
            <hr />

            <h5 className="mb-3">Detail Tambahan</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <td width="30%"><strong>Jenis</strong></td>
                  <td>{barang?.jenis || alokasi.barang?.jenis || 'Tidak ada data'}</td>
                </tr>
                <tr>
                  <td><strong>Deskripsi</strong></td>
                  <td>{barang?.deskripsi || alokasi.barang?.deskripsi || 'Tidak ada data'}</td>
                </tr>
                <tr>
                  <td><strong>Harga</strong></td>
                  <td>{formatRupiah(barang?.harga || alokasi.barang?.harga || 0)}</td>
                </tr>
                <tr>
                  <td><strong>Status Barang</strong></td>
                  <td>{barang?.status_barang || alokasi.barang?.status_barang || 'Tidak ada data'}</td>
                </tr>
              </tbody>
            </Table>

            <hr />

            <h5 className="mb-3">Detail Request Donasi</h5>
            <p className="mb-1"><strong>Deskripsi Request:</strong> {alokasi.requestDonasi?.deskripsi || 'Tidak ada data'}</p>
            <p className="mb-1">
              <strong>Tanggal Pengajuan:</strong> {alokasi.requestDonasi?.tanggal_pengajuan ? 
                formatDate(alokasi.requestDonasi.tanggal_pengajuan) : 'Tidak ada data'}
            </p>

            <div className="mt-5 pt-5">
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <p>Pihak Pemberi</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>ReuseMart</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <p>Pihak Penerima</p>
                    <div className="mt-5">
                      <p>________________________</p>
                      <p>{alokasi.nama_penerima || '...........................'}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default NotaDonasiPrint; 