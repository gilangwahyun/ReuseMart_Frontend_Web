import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBarang, searchBarangAllField } from "../../api/BarangApi";
import PenitipanBarangTable from "../../components/PegawaiGudangComponents/PenitipanBarangTable";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSideBar";

const PenitipanManagement = () => {
  const [barangData, setBarangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const navigate = useNavigate();

  const fetchBarang = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBarang();
      const dataBarang = response || [];
      setBarangData(dataBarang);
    } catch (err) {
      let errorMsg = "Gagal memuat data barang.";
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setError(errorMsg);
      console.error("Fetch Barang Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const handleAddPenitipan = () => {
    navigate(`/pegawaiGudang/form-penitipan`);
  };

  const handleReset = async () => {
    setSearchTerm("");
    setTanggalAwal("");
    setTanggalAkhir("");
    setError(null);
    setSearchLoading(true);
    await fetchBarang();
    setSearchLoading(false);
  };

  const handleCari = async (e) => {
    e && e.preventDefault();
    setSearchLoading(true);
    setError(null);
    try {
      if (!searchTerm.trim() && !tanggalAwal && !tanggalAkhir) {
        await fetchBarang();
        setSearchLoading(false);
        return;
      }
      const result = await searchBarangAllField(searchTerm, tanggalAwal, tanggalAkhir);
      if (!result || result.length === 0) {
        setBarangData([]);
        setError("Barang tidak ditemukan.");
      } else {
        setBarangData(result);
        setError(null);
      }
    } catch (err) {
      let errorMsg = "Gagal melakukan pencarian.";
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setBarangData([]);
      setError(errorMsg);
      console.error("Search Error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <PegawaiGudangSideBar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajemen Penitipan Barang</h2>
            <button className="btn btn-primary" onClick={handleAddPenitipan}>
              + Tambah Penitipan Barang
            </button>
          </div>

          {/* Card Pencarian */}
          <div className="card mb-4 shadow-sm">
            <form className="card-body" onSubmit={handleCari}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label htmlFor="searchTerm" className="form-label fw-semibold">
                    Pencarian Umum (Nama/Kategori/Status/DSB)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchTerm"
                    name="searchTerm"
                    placeholder="Cari nama barang..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="tanggalAwal" className="form-label fw-semibold">
                    Filter Tanggal Awal Penitipan
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="tanggalAwal"
                    name="tanggalAwal"
                    value={tanggalAwal}
                    onChange={e => setTanggalAwal(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="tanggalAkhir" className="form-label fw-semibold">
                    Filter Tanggal Akhir Penitipan
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="tanggalAkhir"
                    name="tanggalAkhir"
                    value={tanggalAkhir}
                    onChange={e => setTanggalAkhir(e.target.value)}
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
              <button className="btn btn-sm btn-outline-light" onClick={fetchBarang}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Tabel Barang */}
          {!loading && !error && (
            <PenitipanBarangTable barangData={barangData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PenitipanManagement;