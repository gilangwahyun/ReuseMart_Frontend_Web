import React, { useEffect, useState } from "react";
import CSSidebar from "../../components/CSSidebar";
import KlaimMerchandiseTable from "../../components/CSComponents/KlaimMerchandiseTable";
import { getAllKlaimMerchandise, updateKlaimMerchandiseStatus } from "../../api/KlaimMerchandiseApi";

const KlaimMerchandiseManagement = () => {
  const [klaimList, setKlaimList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  
  const fetchKlaimMerchandise = async () => {
    setLoading(true);
    try {
      const response = await getAllKlaimMerchandise();
      setKlaimList(response);
      setError(null);
    } catch (err) {
      console.error("Gagal memuat data klaim merchandise:", err);
      setError("Gagal memuat data klaim merchandise.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlaimMerchandise();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status klaim menjadi "${newStatus}"?`)) return;
    
    setLoading(true);
    try {
      await updateKlaimMerchandiseStatus(id, newStatus);
      setSuccess(`Status klaim berhasil diubah menjadi "${newStatus}".`);
      fetchKlaimMerchandise();
    } catch (err) {
      console.error("Gagal mengubah status klaim:", err);
      setError("Gagal mengubah status klaim.");
    } finally {
      setLoading(false);
    }
  };

  // Filter berdasarkan status dan pencarian
  const filteredKlaim = klaimList.filter(klaim => {
    const matchesSearch = 
      klaim.pembeli?.nama_pembeli?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      klaim.merchandise?.nama_merchandise?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "semua") {
      return matchesSearch;
    }
    
    return matchesSearch && klaim.status_klaim === statusFilter;
  });

  // Menghitung jumlah klaim berdasarkan status
  const statusCounts = klaimList.reduce((acc, klaim) => {
    acc[klaim.status_klaim] = (acc[klaim.status_klaim] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="d-flex">
      <CSSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <h2 className="mb-4">Manajemen Klaim Merchandise</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari nama pembeli atau merchandise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="col-md-4">
                  <select 
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="semua">Semua Status</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Belum Diambil">Belum Diambil</option>
                    <option value="Sudah Diambil">Sudah Diambil</option>
                  </select>
                </div>
                
                <div className="col-md-2">
                  <button
                    className="btn btn-secondary w-100"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("semua");
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Klaim Merchandise */}
          <div className="card shadow-sm p-3">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                <span className="ms-2">Memuat data...</span>
              </div>
            ) : (
              <KlaimMerchandiseTable
                data={filteredKlaim}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KlaimMerchandiseManagement; 