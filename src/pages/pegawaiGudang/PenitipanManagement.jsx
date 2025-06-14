import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBarang, searchBarangAllField } from "../../api/BarangApi";
import PenitipanBarangTable from "../../components/PegawaiGudangComponents/PenitipanBarangTable";
import PegawaiGudangSideBar from "../../components/PegawaiGudangSideBar";
import { getAllPenitip } from '../../api/PenitipApi';
import { getAllPegawai } from '../../api/PegawaiApi';
import { getAllKategori } from '../../api/KategoriBarangApi';
import { getAllJabatan } from '../../api/JabatanApi'

const PenitipanManagement = () => {
  const [barangData, setBarangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [penitipList, setPenitipList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [filter, setFilter] = useState({
    nama_penitip: '',
    nama_petugas_qc: '',
    kategori: '',
    status_garansi: '',
    tanggalAwal: '',
    tanggalAkhir: '',
    status_barang: '',
  });

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

  useEffect(() => {
    if (showFilter) {
      getAllPenitip().then(res => setPenitipList(Array.isArray(res) ? res : res?.data || []));
      getAllPegawai().then(res => setPegawaiList(Array.isArray(res) ? res : res?.data || []));
      getAllKategori().then(res => setKategoriList(Array.isArray(res) ? res : res?.data || []));
      getAllJabatan().then(res => setJabatanList(Array.isArray(res) ? res : res?.data || []));
    }
  }, [showFilter]);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterReset = () => {
    setFilter({ nama_penitip: '', nama_petugas_qc: '', kategori: '', status_garansi: '', tanggalAwal: '', tanggalAkhir: '', status_barang: '' });
  };

  const handleFilterPenitip1BulanTerakhir = async () => {
    setSearchLoading(true);
    setError(null);
    try {
      const allBarang = await getAllBarang();
      
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1); //seting 1 bulan terakhir mulai tanggal 12 Mei - 12 Juni
      
      const filtered = allBarang.filter(b => {
        if (!b.penitipan_barang?.tanggal_awal_penitipan || !b.penitipan_barang?.penitip) {
          return false;
        }
        
        const isPenitipGilang = b.penitipan_barang.penitip.nama_penitip === "Gilang Wahyu Nugraha"; //filter nama saya
        const tanggalAwal = new Date(b.penitipan_barang.tanggal_awal_penitipan);
        const isOneMonthRange = tanggalAwal >= oneMonthAgo && tanggalAwal <= today; //cek apakah tanggal penitipan ada di kurun waktu 1 bulan
        
        return isPenitipGilang && isOneMonthRange;
      });
      
      setBarangData(filtered);
      
    } catch (err) {
      let errorMsg = 'Gagal melakukan filter barang 1 bulan terakhir.';
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setBarangData([]);
      setError(errorMsg);
      console.error('Filter Barang Error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFilterSearch = async (e) => {
    e && e.preventDefault();
    setSearchLoading(true);
    setError(null);
    try {
      // Gabungkan searchTerm dan filter, hanya ambil yang terisi
      const params = {};
      if (searchTerm) params.keyword = searchTerm;
      if (filter.tanggalAwal) params.tanggal_awal = filter.tanggalAwal;
      if (filter.tanggalAkhir) params.tanggal_akhir = filter.tanggalAkhir;
      if (filter.nama_penitip) params.nama_penitip = filter.nama_penitip;
      if (filter.nama_petugas_qc) params.nama_petugas_qc = filter.nama_petugas_qc;
      if (filter.kategori) params.kategori = filter.kategori;
      if (filter.status_garansi) params.status_garansi = filter.status_garansi;
      if (filter.status_barang) params.status_barang = filter.status_barang;

      // Jika tidak ada parameter, ambil semua data
      if (Object.keys(params).length === 0) {
        await fetchBarang();
        setSearchLoading(false);
        return;
      }

      // Ambil semua data barang terlebih dahulu
      const allBarang = await getAllBarang();
      
      // Filter data berdasarkan parameter yang diberikan
      let filtered = allBarang;
      
      // Filter by keyword jika ada
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filtered = filtered.filter(b => 
          (b.id_barang && b.id_barang.toString().includes(keyword)) ||
          (b.nama_barang && b.nama_barang.toLowerCase().includes(keyword)) ||
          (b.harga && b.harga.toString().includes(keyword)) ||
          (b.deskripsi && b.deskripsi.toLowerCase().includes(keyword)) ||
          (b.berat && b.berat.toString().includes(keyword)) ||
          (b.status_barang && b.status_barang.toLowerCase().includes(keyword)) ||
          (b.kategori?.nama_kategori && b.kategori.nama_kategori.toLowerCase().includes(keyword)) ||
          (b.penitipan_barang?.penitip?.nama_penitip && b.penitipan_barang.penitip.nama_penitip.toLowerCase().includes(keyword)) ||
          (b.penitipan_barang?.nama_petugas_qc && b.penitipan_barang.nama_petugas_qc.toLowerCase().includes(keyword))
        );
      }
      
      // Filter by tanggal awal
      if (params.tanggal_awal) {
        filtered = filtered.filter(b => 
          b.penitipan_barang?.tanggal_awal_penitipan && 
          new Date(b.penitipan_barang.tanggal_awal_penitipan).toISOString().split('T')[0] === params.tanggal_awal
        );
      }
      
      // Filter by tanggal akhir
      if (params.tanggal_akhir) {
        filtered = filtered.filter(b => 
          b.penitipan_barang?.tanggal_akhir_penitipan && 
          new Date(b.penitipan_barang.tanggal_akhir_penitipan).toISOString().split('T')[0] === params.tanggal_akhir
        );
      }
      
      // Filter by nama penitip
      if (params.nama_penitip) {
        filtered = filtered.filter(b => 
          b.penitipan_barang?.penitip?.nama_penitip === params.nama_penitip
        );
      }
      
      // Filter by nama petugas QC
      if (params.nama_petugas_qc) {
        filtered = filtered.filter(b => 
          b.penitipan_barang?.nama_petugas_qc && 
          b.penitipan_barang.nama_petugas_qc.toLowerCase().includes(params.nama_petugas_qc.toLowerCase())
        );
      }
      
      // Filter by kategori
      if (params.kategori) {
        filtered = filtered.filter(b => 
          b.kategori?.nama_kategori === params.kategori
        );
      }
      
      // Filter by status garansi
      if (params.status_garansi) {
        if (params.status_garansi === 'ada') {
          filtered = filtered.filter(b => b.masa_garansi);
        } else if (params.status_garansi === 'tidak') {
          filtered = filtered.filter(b => !b.masa_garansi);
        }
      }

      // Filter by status_barang
      if (params.status_barang) {
        filtered = filtered.filter(b => 
          b.status_barang === params.status_barang
        );
      }

      // Update state dengan hasil filter
      setBarangData(filtered);
      setError(filtered.length === 0 ? 'Barang tidak ditemukan.' : null);
      
    } catch (err) {
      let errorMsg = 'Gagal melakukan pencarian.';
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setBarangData([]);
      setError(errorMsg);
      console.error('Search Error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter pegawai gudang untuk dropdown
  const pegawaiGudangList = pegawaiList.filter(p => {
    const jabatan = jabatanList.find(j => j.id_jabatan === p.id_jabatan);
    return jabatan && jabatan.nama_jabatan === 'Pegawai Gudang';
  });

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
            <form className="card-body" onSubmit={handleFilterSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    id="searchTerm"
                    name="searchTerm"
                    placeholder="Cari barang (nama, harga, berat, dsb)..."
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
                <div className="col-md-2 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={handleFilterPenitip1BulanTerakhir}
                    disabled={searchLoading}
                  >
                    Barang 1 Bulan Terakhir
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary w-50"
                    onClick={handleReset}
                    disabled={searchLoading}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
            {showFilter && (
              <form className="card-body border-top mt-2" onSubmit={handleFilterSearch}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label">Nama Penitip</label>
                    <select className="form-select" name="nama_penitip" value={filter.nama_penitip} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      {penitipList.map((p) => (
                        <option key={p.id_penitip} value={p.nama_penitip}>{p.nama_penitip}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Nama Petugas QC</label>
                    <select className="form-select" name="nama_petugas_qc" value={filter.nama_petugas_qc} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      {pegawaiGudangList.map((p) => (
                        <option key={p.id_pegawai} value={p.nama_pegawai}>{p.nama_pegawai}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Kategori</label>
                    <select className="form-select" name="kategori" value={filter.kategori} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      {kategoriList.map((k) => (
                        <option key={k.id_kategori} value={k.nama_kategori}>{k.nama_kategori}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Status Barang</label>
                    <select className="form-select" name="status_barang" value={filter.status_barang} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Non Aktif">Non Aktif</option>
                      <option value="Habis">Habis</option>
                      <option value="Barang untuk Donasi">Barang untuk Donasi</option>
                      <option value="Barang sudah Didonasikan">Barang sudah Didonasikan</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Status Garansi</label>
                    <select className="form-select" name="status_garansi" value={filter.status_garansi} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="ada">Ada Garansi</option>
                      <option value="tidak">Tanpa Garansi</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Tanggal Awal</label>
                    <input type="date" className="form-control" name="tanggalAwal" value={filter.tanggalAwal} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Tanggal Akhir</label>
                    <input type="date" className="form-control" name="tanggalAkhir" value={filter.tanggalAkhir} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2 d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary w-100">Terapkan Filter</button>
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={handleFilterReset}>Reset Filter</button>
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