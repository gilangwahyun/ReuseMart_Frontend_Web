import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBarang } from "../../api/BarangApi";
import PenitipanBarangTable from "../../components/PegawaiGudangComponents/PenitipanBarangTable";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSideBar";

const PenitipanManagement = () => {
  const [barangData, setBarangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // Langsung navigasi ke form penitipan (tanpa create data dulu)
    navigate(`/pegawaiGudang/form-penitipan`);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex">
        <div style={{ width: "250px" }}>
          <PegawaiGudangSideBar />
        </div>

        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajemen Penitipan Barang</h2>
            <button className="btn btn-primary" onClick={handleAddPenitipan}>
              + Tambah Penitipan Barang
            </button>
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <span className="ms-2">Memuat data...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-light" onClick={fetchBarang}>
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && (
            <PenitipanBarangTable barangData={barangData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PenitipanManagement;