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

  const navigate = useNavigate();

  const fetchBarang = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBarang();
      const dataBarang = response || [];
      setBarangData(dataBarang);
    } catch (err) {
      setError("Gagal memuat data barang.");
      console.error(err);
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

  const handleSearch = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
    setLoading(true);
    setError(null);

    try {
      const result = await searchBarangAllField(keyword);
      setBarangData(result || []);
    } catch (err) {
      setBarangData([]);
      setError("Gagal melakukan pencarian.");
      console.error(err);
    } finally {
      setLoading(false);
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

            {/* Search Bar */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama barang..."
                value={searchTerm}
                onChange={handleSearch}
              />
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