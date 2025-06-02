import React, { useEffect, useState, useCallback } from "react";
import OwnerSideBar from "../../components/OwnerSideBar";
import RequestDonasiTable from "../../components/OwnerComponents/RequestDonasiTable";
import { getAllRequestDonasi } from "../../api/RequestDonasiApi";

const RequestDonasiManagement = () => {
  const [requestDonasiList, setRequestDonasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRequestDonasi = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllRequestDonasi();
      console.log("Response API Request Donasi:", response); // Debug log untuk response API
      if (Array.isArray(response)) {
        setRequestDonasiList(response);
        setError(null);
      } else {
        setError("Data tidak dalam format yang benar.");
      }
    } catch (err) {
      console.error("Gagal memuat data request donasi:", err);
      setError("Gagal memuat data request donasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequestDonasi();
  }, [fetchRequestDonasi, refreshTrigger]);

  const handleReset = async () => {
    setSearchTerm("");
    setError(null);
    setSearchLoading(true);
    await fetchRequestDonasi();
    setSearchLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      await fetchRequestDonasi();
      return;
    }
    
    setSearchLoading(true);
    try {
      // Filter data berdasarkan searchTerm
      const filteredData = requestDonasiList.filter(
        (item) =>
          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.organisasi?.nama_organisasi && 
           item.organisasi.nama_organisasi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      setRequestDonasiList(filteredData);
      setError(filteredData.length === 0 ? "Tidak ada data yang sesuai dengan pencarian." : null);
    } catch (err) {
      console.error("Error saat mencari:", err);
      setError("Terjadi kesalahan saat mencari data.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler untuk refresh data setelah alokasi donasi berhasil dibuat
  const handleDataUpdated = () => {
    // Menampilkan pesan sukses
    setSuccessMessage('Alokasi donasi berhasil disimpan!');
    
    // Hilangkan pesan setelah 3 detik
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    
    // Trigger refresh data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="d-flex">
      <OwnerSideBar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="mb-3">
            <h2 className="mb-0">Manajerial Request Donasi</h2>
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
                    id="searchTerm"
                    name="searchTerm"
                    placeholder="Cari berdasarkan deskripsi atau nama organisasi..."
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
              <button className="btn btn-sm btn-outline-light" onClick={fetchRequestDonasi}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Tabel Request Donasi */}
          {!loading && !error && (
            <RequestDonasiTable 
              data={requestDonasiList} 
              onDataUpdated={handleDataUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDonasiManagement;