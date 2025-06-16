import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Form, Spinner } from 'react-bootstrap';
import { getAllPembayaranCS, updateStatusVerifikasi, filterPembayaran } from '../../api/PembayaranApi';
import CSSidebar from '../../components/CSSidebar';
import VerifikasiPembayaranTable from '../../components/CSComponents/VerifikasiPembayaranTable';

const VerifikasiPembayaranCS = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // States untuk filter pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState({
    status_verifikasi: '',
    tanggalAwal: '',
    tanggalAkhir: '',
    metode_pembayaran: '',
  });

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const fetchPembayaran = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPembayaranCS();
      setPembayaran(Array.isArray(response.data) ? response.data : response || []);
      setLoading(false);
    } catch (error) {
      let errorMsg = 'Gagal memuat data pembayaran.';
      if (error.response) {
        errorMsg += ` [${error.response.status}] ${JSON.stringify(error.response.data)}`;
      } else if (error.message) {
        errorMsg += ` (${error.message})`;
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleVerifikasi = async (id, status) => {
    try {
      await updateStatusVerifikasi(id, status);
      // Refresh data after update
      fetchPembayaran();
      setSuccessMessage(`Pembayaran berhasil ${status === 'Sudah Diverifikasi' ? 'diverifikasi' : 'ditolak'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Gagal memperbarui status verifikasi');
    }
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filter
  const handleReset = async () => {
    setSearchTerm("");
    setFilter({
      status_verifikasi: '',
      tanggalAwal: '',
      tanggalAkhir: '',
      metode_pembayaran: '',
    });
    setError(null);
    setSearchLoading(true);
    await fetchPembayaran();
    setSearchLoading(false);
  };
  
  // Apply filter
  const handleFilterSearch = async (e) => {
    e && e.preventDefault();
    setSearchLoading(true);
    setError(null);
    
    try {
      // Buat parameter pencarian
      const params = {};
      if (searchTerm) params.keyword = searchTerm;
      if (filter.status_verifikasi) params.status_verifikasi = filter.status_verifikasi;
      if (filter.metode_pembayaran) params.metode_pembayaran = filter.metode_pembayaran;
      if (filter.tanggalAwal) params.tanggal_awal = filter.tanggalAwal;
      if (filter.tanggalAkhir) params.tanggal_akhir = filter.tanggalAkhir;
      
      // Jika tidak ada parameter, ambil semua data
      if (Object.keys(params).length === 0) {
        await fetchPembayaran();
        setSearchLoading(false);
        return;
      }
      
      // Filter locally since the backend API might not fully support all these filters yet
      const allPembayaran = await getAllPembayaranCS();
      let filteredData = Array.isArray(allPembayaran.data) ? allPembayaran.data : allPembayaran || [];
      
      // Filter by keyword
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.id_pembayaran && item.id_pembayaran.toString().includes(keyword)) ||
          (item.id_transaksi && item.id_transaksi.toString().includes(keyword)) ||
          (item.metode_pembayaran && item.metode_pembayaran.toLowerCase().includes(keyword))
        );
      }
      
      // Filter by status
      if (params.status_verifikasi) {
        filteredData = filteredData.filter(item => item.status_verifikasi === params.status_verifikasi);
      }
      
      // Filter by metode pembayaran
      if (params.metode_pembayaran) {
        filteredData = filteredData.filter(item => item.metode_pembayaran === params.metode_pembayaran);
      }
      
      // Filter by tanggal
      if (params.tanggal_awal) {
        const tanggalAwal = new Date(params.tanggal_awal);
        filteredData = filteredData.filter(item => {
          const tanggalPembayaran = new Date(item.tanggal_pembayaran);
          return tanggalPembayaran >= tanggalAwal;
        });
      }
      
      if (params.tanggal_akhir) {
        const tanggalAkhir = new Date(params.tanggal_akhir);
        tanggalAkhir.setHours(23, 59, 59); // Set to end of day
        filteredData = filteredData.filter(item => {
          const tanggalPembayaran = new Date(item.tanggal_pembayaran);
          return tanggalPembayaran <= tanggalAkhir;
        });
      }
      
      setPembayaran(filteredData);
      setError(filteredData.length === 0 ? 'Pembayaran tidak ditemukan.' : null);
      
    } catch (err) {
      let errorMsg = 'Gagal melakukan pencarian.';
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setPembayaran([]);
      setError(errorMsg);
      console.error('Search Error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <CSSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Verifikasi Pembayaran</h2>
          </div>

          {/* Card Pencarian */}
          <div className="card mb-4 shadow-sm">
            <form className="card-body" onSubmit={handleFilterSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    id="searchTerm"
                    name="searchTerm"
                    placeholder="Cari pembayaran (ID Pembayaran, ID Transaksi)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                    disabled={searchLoading}
                  >
                    {searchLoading && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    Cari
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowFilter((prev) => !prev)}
                  >
                    Filter
                  </button>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={handleReset}
                    disabled={searchLoading}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
            
            {/* Filter tambahan */}
            {showFilter && (
              <form className="card-body border-top mt-2" onSubmit={handleFilterSearch}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label">Status Verifikasi</label>
                    <select className="form-select" name="status_verifikasi" value={filter.status_verifikasi} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                      <option value="Sudah Diverifikasi">Sudah Diverifikasi</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Metode Pembayaran</label>
                    <select className="form-select" name="metode_pembayaran" value={filter.metode_pembayaran} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="Transfer Bank">Transfer Bank</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Virtual Account">Virtual Account</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tanggal Awal</label>
                    <input type="date" className="form-control" name="tanggalAwal" value={filter.tanggalAwal} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tanggal Akhir</label>
                    <input type="date" className="form-control" name="tanggalAkhir" value={filter.tanggalAkhir} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2 d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary w-100">Terapkan Filter</button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary w-100" 
                      onClick={() => setFilter({
                        status_verifikasi: '',
                        tanggalAwal: '',
                        tanggalAkhir: '',
                        metode_pembayaran: '',
                      })}
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="mb-3">
              {successMessage}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-light" onClick={fetchPembayaran}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Tabel Klaim Merchandise */}
          <div className="card shadow-sm p-3">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                <span className="ms-2">Memuat data...</span>
              </div>
            ) : (
              <VerifikasiPembayaranTable 
                pembayaranData={pembayaran} 
                handleVerifikasi={handleVerifikasi}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifikasiPembayaranCS;