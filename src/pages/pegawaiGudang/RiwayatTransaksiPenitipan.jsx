import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PegawaiGudangSidebar from '../../components/PegawaiGudangSidebar';
import { getAllPenitipanBarang } from '../../api/PenitipanBarangApi';
import { getAllNotaPenitipanBarang } from '../../api/NotaPenitipanBarangApi';
import { FaPrint, FaSearch, FaEye, FaTimes } from 'react-icons/fa';

const RiwayatTransaksiPenitipan = () => {
  const [penitipanList, setPenitipanList] = useState([]);
  const [notaList, setNotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredList, setFilteredList] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  
  const navigate = useNavigate();

  // Fungsi untuk mengambil data penitipan dan nota
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mengambil data penitipan
      const penitipanData = await getAllPenitipanBarang();
      
      // Mengambil data nota
      const notaData = await getAllNotaPenitipanBarang();
      
      if (Array.isArray(penitipanData) && Array.isArray(notaData)) {
        // Urutkan data terbaru dulu
        const sortedData = penitipanData.sort((a, b) => {
          return new Date(b.tanggal_awal_penitipan) - new Date(a.tanggal_awal_penitipan);
        });
        setPenitipanList(sortedData);
        setFilteredList(sortedData);
        setNotaList(notaData);
      } else {
        throw new Error('Data tidak valid');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data berdasarkan pencarian dan rentang tanggal
  const handleFilter = () => {
    let filtered = [...penitipanList];

    // Filter berdasarkan pencarian (nama penitip, id penitipan, atau nama petugas)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.penitip?.nama_penitip && item.penitip.nama_penitip.toLowerCase().includes(searchLower)) ||
        (item.id_penitipan && item.id_penitipan.toString().includes(searchTerm)) ||
        (item.nama_petugas_qc && item.nama_petugas_qc.toLowerCase().includes(searchLower))
      );
    }

    // Filter berdasarkan rentang tanggal
    if (dateRange.start) {
      filtered = filtered.filter(item => 
        new Date(item.tanggal_awal_penitipan) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(item => 
        new Date(item.tanggal_awal_penitipan) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    setFilteredList(filtered);
  };

  // Fungsi untuk mereset filter
  const handleReset = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setFilteredList(penitipanList);
  };

  // Fungsi untuk mencetak nota
  const handlePrintNota = (id_penitipan) => {
    try {
      // Cari nota yang sesuai dengan id_penitipan
      const nota = notaList.find(nota => nota.id_penitipan === id_penitipan);
      
      if (nota) {
        // Redirect ke halaman cetak nota dengan id_nota_penitipan
        navigate(`/pegawaiGudang/nota-penitipan/print?id_nota_penitipan=${nota.id_nota_penitipan}&from=riwayat-transaksi`);
      } else {
        setError('Nota tidak ditemukan untuk penitipan ini');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error handling nota:', err);
      setError('Gagal memproses nota');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fungsi untuk melihat detail penitipan
  const handleViewDetail = (id_penitipan) => {
    const penitipan = penitipanList.find(item => item.id_penitipan === id_penitipan);
    if (penitipan) {
      setSelectedPenitipan(penitipan);
      setShowDetailModal(true);
    } else {
      setError('Data penitipan tidak ditemukan');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fungsi untuk menutup modal detail
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPenitipan(null);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="d-flex">
      <PegawaiGudangSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="mb-3">
            <h2 className="mb-0">Riwayat Transaksi Penitipan</h2>
            <p className="text-muted">Menampilkan riwayat transaksi penitipan dan mencetak ulang nota</p>
          </div>

          {/* Pesan Sukses */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage('')}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Form Filter */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="searchTerm" className="form-label">Cari</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaSearch /></span>
                    <input
                      type="text"
                      className="form-control"
                      id="searchTerm"
                      placeholder="Nama penitip, ID, petugas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label htmlFor="startDate" className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="endDate" className="form-label">Tanggal Akhir</label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="d-grid gap-2 w-100">
                    <button 
                      className="btn btn-primary" 
                      onClick={handleFilter}
                    >
                      Filter
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <span className="ms-2">Memuat data...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Tabel Riwayat Transaksi */}
          {!loading && !error && (
            <>
              {filteredList.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>ID Penitipan</th>
                        <th>Penitip</th>
                        <th>Tanggal Awal</th>
                        <th>Tanggal Akhir</th>
                        <th>Petugas QC</th>
                        <th>Jumlah Barang</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((penitipan) => (
                        <tr key={penitipan.id_penitipan}>
                          <td>{penitipan.id_penitipan}</td>
                          <td>{penitipan.penitip?.nama_penitip || '-'}</td>
                          <td>{penitipan.tanggal_awal_penitipan?.split(' ')[0] || '-'}</td>
                          <td>{penitipan.tanggal_akhir_penitipan?.split(' ')[0] || '-'}</td>
                          <td>{penitipan.nama_petugas_qc || '-'}</td>
                          <td>{penitipan.barang?.length || 0}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-primary" 
                                onClick={() => handlePrintNota(penitipan.id_penitipan)}
                                title="Cetak Nota"
                              >
                                <FaPrint />
                              </button>
                              <button 
                                className="btn btn-sm btn-info text-white" 
                                onClick={() => handleViewDetail(penitipan.id_penitipan)}
                                title="Lihat Detail"
                              >
                                <FaEye />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-warning">
                  Tidak ada data transaksi penitipan yang ditemukan.
                </div>
              )}
            </>
          )}

          {/* Modal Detail Penitipan */}
          {showDetailModal && selectedPenitipan && (
            <div className="modal fade show" tabIndex="-1" role="dialog" 
                style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header bg-info text-white">
                    <h5 className="modal-title">Detail Penitipan #{selectedPenitipan.id_penitipan}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={handleCloseModal}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Informasi Penitipan</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>ID Penitipan:</strong> {selectedPenitipan.id_penitipan}</p>
                            <p><strong>Tanggal Awal:</strong> {formatDate(selectedPenitipan.tanggal_awal_penitipan)}</p>
                            <p><strong>Tanggal Akhir:</strong> {formatDate(selectedPenitipan.tanggal_akhir_penitipan)}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Penitip:</strong> {selectedPenitipan.penitip?.nama_penitip || '-'}</p>
                            <p><strong>Alamat Penitip:</strong> {selectedPenitipan.penitip?.alamat || '-'}</p>
                            <p><strong>Petugas QC:</strong> {selectedPenitipan.nama_petugas_qc || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Daftar Barang</h6>
                      </div>
                      <div className="card-body">
                        {selectedPenitipan.barang && selectedPenitipan.barang.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                              <thead className="table-secondary">
                                <tr>
                                  <th>Nama Barang</th>
                                  <th>Kategori</th>
                                  <th>Harga (Rp)</th>
                                  <th>Berat (g)</th>
                                  <th>Status Garansi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPenitipan.barang.map((barang) => (
                                  <tr key={barang.id_barang}>
                                    <td>{barang.nama_barang}</td>
                                    <td>{barang.kategori?.nama_kategori || '-'}</td>
                                    <td>{barang.harga?.toLocaleString('id-ID') || '-'}</td>
                                    <td>{barang.berat || '-'}</td>
                                    <td>
                                      {barang.masa_garansi ? (
                                        <span className="badge bg-success">Ya</span>
                                      ) : (
                                        <span className="badge bg-danger">Tidak</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="alert alert-warning">
                            Tidak ada data barang dalam penitipan ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        handleCloseModal();
                        handlePrintNota(selectedPenitipan.id_penitipan);
                      }}
                    >
                      <FaPrint className="me-1" /> Cetak Nota
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleCloseModal}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiwayatTransaksiPenitipan; 