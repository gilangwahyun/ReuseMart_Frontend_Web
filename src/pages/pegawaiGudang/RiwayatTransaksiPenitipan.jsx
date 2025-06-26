import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PegawaiGudangSideBar from '../../components/PegawaiGudangSidebar';
import { getAllPenitipanBarang, updatePenitipanBarang } from '../../api/PenitipanBarangApi';
import { getAllNotaPenitipanBarang } from '../../api/NotaPenitipanBarangApi';
import { FaPrint, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import { getAllPenitip } from "../../api/PenitipApi";
import { getAllPegawai } from "../../api/PegawaiApi";
import { getAllJabatan } from "../../api/JabatanApi";
import RiwayatPenitipanTable from '../../components/PegawaiGudangComponents/RiwayatPenitipanTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id_penitipan: '',
    id_penitip: '',
    tanggal_awal_penitipan: '',
    tanggal_akhir_penitipan: '',
    nama_petugas_qc: '',
    id_pegawai: '',
  });
  const [penitipList, setPenitipList] = useState([]);
  const [qcList, setQcList] = useState([]);
  const [hunterList, setHunterList] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [affectedBarangList, setAffectedBarangList] = useState([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState({
    nama_penitip: '',
    nama_petugas_qc: '',
    hunter: '',
    id_penitipan: '',
  });
  
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
      
      // Mengambil data penitip dan pegawai untuk keperluan edit
      const [penitipRes, pegawaiRes, jabatanRes] = await Promise.all([
        getAllPenitip(),
        getAllPegawai(),
        getAllJabatan(),
      ]);

      const penitips = penitipRes || [];
      setPenitipList(penitips);

      const pegawais = pegawaiRes?.data || [];
      const jabatans = jabatanRes?.data || [];

      const jabatanMap = {};
      jabatans.forEach((jab) => {
        jabatanMap[jab.id_jabatan] = jab.nama_jabatan;
      });

      const pegawaiGudangList = pegawais.filter(
        (pegawai) => jabatanMap[pegawai.id_jabatan] === "Pegawai Gudang"
      );

      const huntersList = pegawais.filter(
        (pegawai) => jabatanMap[pegawai.id_jabatan] === "Hunter"
      );

      const formattedQC = pegawaiGudangList.map((pegawai) => ({
        label: `${pegawai.nama_pegawai} (ID: ${pegawai.id_pegawai})`,
        value: `${pegawai.nama_pegawai} (ID: ${pegawai.id_pegawai})`,
      }));

      const formattedHunter = huntersList.map((pegawai) => ({
        label: `${pegawai.nama_pegawai}`,
        value: pegawai.id_pegawai,
      }));

      setQcList(formattedQC);
      setHunterList(formattedHunter);
      
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

  // Filter data berdasarkan pencarian dan filter yang diaplikasikan
  const handleFilter = () => {
    setSearchLoading(true);
    
    try {
      // Ambil semua data penitipan sebagai awal filter
      let filtered = [...penitipanList];
      
      // Filter berdasarkan kata kunci pencarian (searchTerm)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          (item.penitip?.nama_penitip && item.penitip.nama_penitip.toLowerCase().includes(searchLower)) ||
          (item.id_penitipan && item.id_penitipan.toString().includes(searchTerm)) ||
          (item.nama_petugas_qc && item.nama_petugas_qc.toLowerCase().includes(searchLower))
        );
      }
      
      // Filter berdasarkan ID penitipan
      if (filter.id_penitipan) {
        filtered = filtered.filter(item => 
          item.id_penitipan && item.id_penitipan.toString() === filter.id_penitipan.toString()
        );
      }
      
      // Filter berdasarkan nama penitip
      if (filter.nama_penitip) {
        filtered = filtered.filter(item => 
          item.penitip?.id_penitip && item.penitip.id_penitip.toString() === filter.nama_penitip.toString()
        );
      }

      // Filter berdasarkan nama petugas QC
      if (filter.nama_petugas_qc) {
        filtered = filtered.filter(item =>
          item.nama_petugas_qc && item.nama_petugas_qc.includes(filter.nama_petugas_qc)
        );
      }

      // Filter berdasarkan hunter
      if (filter.hunter) {
        filtered = filtered.filter(item =>
          item.id_pegawai && item.id_pegawai.toString() === filter.hunter.toString()
        );
      }

      // Filter berdasarkan tanggal awal penitipan
      if (dateRange.start) {
        const startDateStr = dateRange.start; // format "YYYY-MM-DD"
        
        filtered = filtered.filter(item => {
          if (!item.tanggal_awal_penitipan) return false;
          
          // Ambil tanggal saja dari datetime, konversi ke format YYYY-MM-DD
          const itemDate = new Date(item.tanggal_awal_penitipan);
          const itemDateStr = itemDate.toISOString().substring(0, 10); // YYYY-MM-DD
          
          // Bandingkan string tanggal saja
          return itemDateStr === startDateStr;
        });
      }
      
      // Filter berdasarkan tanggal akhir penitipan
      if (dateRange.end) {
        const endDateStr = dateRange.end; // format "YYYY-MM-DD"
        
        filtered = filtered.filter(item => {
          if (!item.tanggal_akhir_penitipan) return false;
          
          // Ambil tanggal saja dari datetime, konversi ke format YYYY-MM-DD
          const itemDate = new Date(item.tanggal_akhir_penitipan);
          const itemDateStr = itemDate.toISOString().substring(0, 10); // YYYY-MM-DD
          
          // Bandingkan string tanggal saja
          return itemDateStr === endDateStr;
        });
      }

      console.log('Filtered list:', filtered);
      console.log('Filter criteria:', { dateRange, filter, searchTerm });
      
      // Update state dengan hasil filter
      setFilteredList(filtered);
      
      // Tampilkan pesan jika tidak ada hasil
      if (filtered.length === 0) {
        toast.info('Tidak ada data yang sesuai dengan filter');
      }
    } catch (err) {
      console.error('Error filtering data:', err);
      toast.error('Terjadi kesalahan saat memfilter data');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler untuk perubahan filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk mereset filter
  const handleReset = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setFilter({
      nama_penitip: '',
      nama_petugas_qc: '',
      hunter: '',
      id_penitipan: '',
    });
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
        toast.error('Nota tidak ditemukan untuk penitipan ini');
      }
    } catch (err) {
      console.error('Error handling nota:', err);
      toast.error('Gagal memproses nota');
    }
  };

  // Fungsi untuk melihat detail penitipan
  const handleViewDetail = (id_penitipan) => {
    const penitipan = penitipanList.find(item => item.id_penitipan === id_penitipan);
    if (penitipan) {
      setSelectedPenitipan(penitipan);
      setShowDetailModal(true);
    } else {
      toast.error('Data penitipan tidak ditemukan');
    }
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

  // Format ISO datetime string atau Date object ke "YYYY-MM-DD HH:MM:SS"
  const formatToDateTimeString = (isoString) => {
    const date = new Date(isoString);
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Format date to "YYYY-MM-DDTHH:mm" for datetime-local input
  const formatToDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format tanggal untuk tampilan yang lebih baik
  const formatDisplayDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // Fungsi untuk menutup modal detail
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPenitipan(null);
  };

  // Fungsi untuk edit penitipan
  const handleEditPenitipan = (id_penitipan) => {
    const penitipan = penitipanList.find(item => item.id_penitipan === id_penitipan);
    if (penitipan) {
      setEditForm({
        id_penitipan: penitipan.id_penitipan,
        id_penitip: penitipan.id_penitip || penitipan.penitip?.id_penitip || '',
        tanggal_awal_penitipan: formatToDateTimeLocal(penitipan.tanggal_awal_penitipan),
        tanggal_akhir_penitipan: formatToDateTimeLocal(penitipan.tanggal_akhir_penitipan),
        nama_petugas_qc: penitipan.nama_petugas_qc || '',
        id_pegawai: penitipan.id_pegawai || '',
      });

      // Tetapkan daftar barang yang terpengaruh
      setAffectedBarangList(penitipan.barang || []);
      
      setShowEditModal(true);
    } else {
      toast.error('Data penitipan tidak ditemukan');
    }
  };

  // Handle perubahan pada form edit
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk konfirmasi update
  const handleConfirmUpdate = () => {
    // Validasi form
    if (!editForm.id_penitip || !editForm.nama_petugas_qc) {
      toast.warning('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    // Tampilkan modal konfirmasi jika ada barang yang terpengaruh
    if (affectedBarangList.length > 0) {
      setShowConfirmModal(true);
    } else {
      handleUpdatePenitipan();
    }
  };

  // Fungsi untuk update data penitipan
  const handleUpdatePenitipan = async () => {
    try {
      setShowConfirmModal(false);
      
      const payload = {
        id_penitip: editForm.id_penitip,
        tanggal_awal_penitipan: formatToDateTimeString(editForm.tanggal_awal_penitipan),
        tanggal_akhir_penitipan: formatToDateTimeString(editForm.tanggal_akhir_penitipan),
        nama_petugas_qc: editForm.nama_petugas_qc,
        id_pegawai: editForm.id_pegawai || null,
      };

      await updatePenitipanBarang(editForm.id_penitipan, payload);
      
      toast.success('Data penitipan berhasil diperbarui');
      setShowEditModal(false);
      fetchData(); // Refresh data setelah update
    } catch (err) {
      console.error('Error updating data:', err);
      toast.error('Gagal memperbarui data penitipan');
    }
  };

  return (
    <>
      <div className="d-flex">
        <PegawaiGudangSideBar />
        <div className="p-4 w-100">
          <div className="flex-grow-1 ms-3">
            <div className="mb-3">
              <h2 className="mb-0">Riwayat Transaksi Penitipan</h2>
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
              <form className="card-body" onSubmit={(e) => { e.preventDefault(); handleFilter(); }}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      id="searchTerm"
                      name="searchTerm"
                      placeholder="Cari penitipan (nama penitip, ID, petugas QC...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                      onClick={() => setShowAdvancedFilter((prev) => !prev)}
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
              {showAdvancedFilter && (
                <form className="card-body border-top mt-2" onSubmit={(e) => { e.preventDefault(); handleFilter(); }}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label">ID Penitipan</label>
                      <input
                        type="text"
                        className="form-control"
                        name="id_penitipan"
                        value={filter.id_penitipan}
                        onChange={handleFilterChange}
                        placeholder="Masukkan ID penitipan"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Nama Penitip</label>
                      <select
                        className="form-select"
                        name="nama_penitip"
                        value={filter.nama_penitip}
                        onChange={handleFilterChange}
                      >
                        <option value="">Semua</option>
                        {penitipList.map(penitip => (
                          <option key={penitip.id_penitip} value={penitip.id_penitip}>
                            {penitip.nama_penitip}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Nama Petugas QC</label>
                      <select
                        className="form-select"
                        name="nama_petugas_qc"
                        value={filter.nama_petugas_qc}
                        onChange={handleFilterChange}
                      >
                        <option value="">Semua</option>
                        {qcList.map(qc => (
                          <option key={qc.value} value={qc.value}>
                            {qc.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Hunter</label>
                      <select
                        className="form-select"
                        name="hunter"
                        value={filter.hunter}
                        onChange={handleFilterChange}
                      >
                        <option value="">Semua</option>
                        {hunterList.map(hunter => (
                          <option key={hunter.value} value={hunter.value}>
                            {hunter.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Tanggal Awal</label>
                      <input
                        type="date"
                        className="form-control"
                        name="start"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Tanggal Akhir</label>
                      <input
                        type="date"
                        className="form-control"
                        name="end"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2 d-flex gap-2 mt-3">
                      <button type="submit" className="btn btn-primary w-100">Terapkan Filter</button>
                      <button type="button" className="btn btn-outline-secondary w-100" onClick={handleReset}>Reset Filter</button>
                    </div>
                  </div>
                </form>
              )}
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
              <RiwayatPenitipanTable 
                penitipanList={filteredList}
                onPrintNota={handlePrintNota}
                onViewDetail={handleViewDetail}
                onEditPenitipan={handleEditPenitipan}
                formatDate={formatDate}
              />
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
                              <p><strong>Tanggal Awal:</strong> {formatDisplayDateTime(selectedPenitipan.tanggal_awal_penitipan)}</p>
                              <p><strong>Tanggal Akhir:</strong> {formatDisplayDateTime(selectedPenitipan.tanggal_akhir_penitipan)}</p>
                            </div>
                            <div className="col-md-6">
                              <p><strong>Penitip:</strong> {selectedPenitipan.penitip?.nama_penitip || '-'}</p>
                              <p><strong>Alamat Penitip:</strong> {selectedPenitipan.penitip?.alamat || '-'}</p>
                              <p><strong>Petugas QC:</strong> {selectedPenitipan.nama_petugas_qc || '-'}</p>
                              <p><strong>Hunter:</strong> {selectedPenitipan.pegawai ? 
                                `${selectedPenitipan.pegawai.nama_pegawai} (ID: ${selectedPenitipan.pegawai.id_pegawai})` : 
                                '-'}
                              </p>
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

            {/* Modal Edit Penitipan */}
            {showEditModal && (
              <div className="modal fade show" tabIndex="-1" role="dialog" 
                  style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header bg-warning text-white">
                      <h5 className="modal-title">Edit Penitipan #{editForm.id_penitipan}</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowEditModal(false)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-info">
                        <strong>Perhatian:</strong> Mengubah data penitipan akan mempengaruhi seluruh barang yang terkait dengan penitipan ini.
                      </div>

                      <form>
                        <div className="row g-3">
                          <div className="col-md-12">
                            <label className="form-label fw-semibold">Penitip</label>
                            <select
                              className="form-control"
                              name="id_penitip"
                              value={editForm.id_penitip}
                              onChange={handleEditFormChange}
                              required
                            >
                              <option value="">-- Pilih Penitip --</option>
                              {penitipList.map((penitip) => (
                                <option key={penitip.id_penitip} value={penitip.id_penitip}>
                                  {penitip.nama_penitip} (ID: {penitip.id_penitip})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Tanggal Awal Penitipan</label>
                            <input
                              type="datetime-local"
                              className="form-control bg-light"
                              name="tanggal_awal_penitipan"
                              value={editForm.tanggal_awal_penitipan}
                              onChange={handleEditFormChange}
                              readOnly
                            />
                            <div className="form-text text-dark fw-medium mt-1">
                              {formatDisplayDateTime(editForm.tanggal_awal_penitipan)}
                            </div>
                            <div className="form-text text-muted">
                              Tanggal awal penitipan tidak dapat diubah
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Tanggal Akhir Penitipan</label>
                            <input
                              type="datetime-local"
                              className="form-control bg-light"
                              name="tanggal_akhir_penitipan"
                              value={editForm.tanggal_akhir_penitipan}
                              onChange={handleEditFormChange}
                              readOnly
                            />
                            <div className="form-text text-dark fw-medium mt-1">
                              {formatDisplayDateTime(editForm.tanggal_akhir_penitipan)}
                            </div>
                            <div className="form-text text-muted">
                              Tanggal akhir penitipan tidak dapat diubah
                            </div>
                          </div>
                          <div className="col-md-12">
                            <label className="form-label fw-semibold">Petugas QC (Pegawai Gudang)</label>
                            <select
                              className="form-control"
                              name="nama_petugas_qc"
                              value={editForm.nama_petugas_qc}
                              onChange={handleEditFormChange}
                              required
                            >
                              <option value="">-- Pilih Petugas QC --</option>
                              {qcList.map((qc) => (
                                <option key={qc.value} value={qc.value}>
                                  {qc.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-12">
                            <label className="form-label fw-semibold">Hunter (Opsional)</label>
                            <select
                              className="form-control"
                              name="id_pegawai"
                              value={editForm.id_pegawai}
                              onChange={handleEditFormChange}
                            >
                              <option value="">-- Tidak Ada Hunter --</option>
                              {hunterList.map((hunter) => (
                                <option key={hunter.value} value={hunter.value}>
                                  {hunter.label}
                                </option>
                              ))}
                            </select>
                            <div className="form-text text-muted">
                              Pilih Hunter jika barang ini dititipkan dengan bantuan Hunter
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowEditModal(false)}
                      >
                        Batal
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-warning text-white" 
                        onClick={handleConfirmUpdate}
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Konfirmasi Update dengan Barang Terpengaruh */}
            {showConfirmModal && (
              <div className="modal fade show" tabIndex="-1" role="dialog" 
                  style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                      <h5 className="modal-title">Konfirmasi Perubahan</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowConfirmModal(false)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-warning">
                        <strong>Perhatian!</strong> Perubahan pada data penitipan ini akan mempengaruhi {affectedBarangList.length} barang berikut:
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                          <thead className="table-secondary">
                            <tr>
                              <th>Nama Barang</th>
                              <th>Kategori</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {affectedBarangList.map((barang) => (
                              <tr key={barang.id_barang}>
                                <td>{barang.nama_barang}</td>
                                <td>{barang.kategori?.nama_kategori || '-'}</td>
                                <td>{barang.status_barang}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p className="mt-3">Apakah Anda yakin ingin melanjutkan perubahan?</p>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowConfirmModal(false)}
                      >
                        Batal
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={handleUpdatePenitipan}
                      >
                        Ya, Lanjutkan Perubahan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default RiwayatTransaksiPenitipan; 