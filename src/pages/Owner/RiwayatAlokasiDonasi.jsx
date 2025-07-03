import React, { useState, useEffect, useCallback } from 'react';
import OwnerSideBar from "../../components/OwnerSideBar";
import RiwayatAlokasiDonasiTable from '../../components/OwnerComponents/RiwayatAlokasiDonasiTable';
import { getAllAlokasiDonasi, searchByOrganisasi } from "../../api/AlokasiDonasiApi";

const RiwayatAlokasiDonasi = () => {
  const [alokasiDonasi, setAlokasiDonasi] = useState([]);
  const [filteredAlokasiDonasi, setFilteredAlokasiDonasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Buat fungsi fetchAlokasiDonasi sebagai useCallback agar bisa digunakan di useEffect dan sebagai handler
  const fetchAlokasiDonasi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAlokasiDonasi();
      if (response && Array.isArray(response)) {
        setAlokasiDonasi(response);
        setFilteredAlokasiDonasi(response);
      } else {
        throw new Error('Data tidak valid');
      }
    } catch (error) {
      console.error('Gagal mengambil data alokasi donasi', error);
      setError('Gagal mengambil data alokasi donasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk memicu refresh data
  const handleDataUpdated = () => {
    // Menampilkan pesan sukses
    setSuccessMessage('Data berhasil diperbarui!');
    
    // Hilangkan pesan setelah 3 detik
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    
    // Perbarui trigger untuk refresh data
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchAlokasiDonasi();
  }, [fetchAlokasiDonasi, refreshTrigger]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError(null);
    setSearchLoading(true);

    try {
      if (!searchQuery.trim()) {
        setFilteredAlokasiDonasi(alokasiDonasi);
        setSearchLoading(false);
        return;
      }

      const result = await searchByOrganisasi(searchQuery);
      setFilteredAlokasiDonasi(result);
    } catch (err) {
      if (err.response?.status === 404) {
        setFilteredAlokasiDonasi([]);
        setSearchError('Tidak ada data alokasi donasi yang cocok.');
      } else {
        console.error("Search error:", err);
        setSearchError('Terjadi kesalahan saat mencari data.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchError(null);
    setFilteredAlokasiDonasi(alokasiDonasi);
  };

  return (
    <div className="d-flex">
      <OwnerSideBar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="mb-3">
            <h2 className="mb-0">Riwayat Alokasi Donasi</h2>
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

          {/* Card Pencarian */}
          <div className="card mb-4 shadow-sm">
            <form className="card-body" onSubmit={handleSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari organisasi"
                    value={searchQuery}
                    onChange={handleSearchChange}
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

              {/* Error pencarian */}
              {searchError && (
                <div className="text-danger mt-2">{searchError}</div>
              )}
            </form>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <span className="ms-2">Memuat data...</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-light" onClick={fetchAlokasiDonasi}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Tabel Alokasi Donasi */}
          {!loading && !error && (
            <RiwayatAlokasiDonasiTable
              alokasiDonasi={filteredAlokasiDonasi}
              setAlokasiDonasi={setFilteredAlokasiDonasi}
              onDataUpdated={handleDataUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RiwayatAlokasiDonasi;