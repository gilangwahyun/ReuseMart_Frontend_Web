import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPenitipanBarang, deletePenitipanBarang } from "../../api/PenitipanBarangApi";
import { getAllPenitip, getPenitipById } from "../../api/PenitipApi";
import { getAllPegawai } from "../../api/PegawaiApi";
import { getAllJabatan } from "../../api/JabatanApi";
import { createNotaPenitipanBarang, deleteNotaPenitipanBarang } from "../../api/NotaPenitipanBarangApi";
import { ToastContainer, toast } from "react-toastify";

const PenitipanBarangForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_penitip: "",
    tanggal_awal_penitipan: "",
    tanggal_akhir_penitipan: "",
    nama_petugas_qc: "",
    id_pegawai: "",
  });

  const [penitipList, setPenitipList] = useState([]);
  const [qcList, setQcList] = useState([]);
  const [hunterList, setHunterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const idPenitipan = searchParams.get("id_penitipan");
  const idNotaPenitipan = searchParams.get("id_nota_penitipan");

  const [idNotaPenitipanState, setIdNotaPenitipanState] = useState(null);

  // Format date to "YYYY-MM-DDTHH:mm" for datetime-local input
  const formatToDateTimeLocal = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format ISO datetime string or Date object to "YYYY-MM-DD HH:MM:SS"
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

  // Set tanggal awal dan akhir saat pertama kali mount
  useEffect(() => {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + 30);

    setFormData((prev) => ({
      ...prev,
      tanggal_awal_penitipan: formatToDateTimeLocal(now),
      tanggal_akhir_penitipan: formatToDateTimeLocal(future),
    }));
  }, []);

  // Fetch penitip, pegawai, dan jabatan
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError("Gagal memuat data penitip atau pegawai.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const confirm = window.confirm("Apakah Anda yakin ingin menyimpan data ini?");
  if (!confirm) return;

  try {
    const payload = {
      id_penitip: formData.id_penitip,
      tanggal_awal_penitipan: formatToDateTimeString(formData.tanggal_awal_penitipan),
      tanggal_akhir_penitipan: formatToDateTimeString(formData.tanggal_akhir_penitipan),
      nama_petugas_qc: formData.nama_petugas_qc,
      id_pegawai: formData.id_pegawai || null,
    };

    const response = await createPenitipanBarang(payload);
    const id_penitipan = response.data?.id_penitipan || response.id_penitipan || response;
    if (!id_penitipan) throw new Error("ID Penitipan tidak ditemukan.");

    const penitipDetail = await getPenitipById(formData.id_penitip);
    if (!penitipDetail) throw new Error("Data penitip tidak ditemukan.");

    const notaPayload = {
      id_penitipan: id_penitipan,
      tanggal_penitipan: payload.tanggal_awal_penitipan,
      tanggal_akhir_penitipan: payload.tanggal_akhir_penitipan,
      nama_petugas_qc: payload.nama_petugas_qc,
      id_penitip: penitipDetail.id_penitip,
      nama_penitip: penitipDetail.nama_penitip,
      alamat_penitip: penitipDetail.alamat,
      email_penitip: penitipDetail?.user?.email,
    };

    const responseNota = await createNotaPenitipanBarang(notaPayload);
    const id_nota_penitipan =
      responseNota.data?.id_nota_penitipan || responseNota.id_nota_penitipan || responseNota;

    // ✅ Tampilkan toast sukses
    toast.success("Data berhasil disimpan!", {
      position: "top-right",
      autoClose: 3000,
    });

    // Navigasi dengan sedikit delay agar toast sempat tampil
    setTimeout(() => {
      navigate(`/pegawaiGudang/form-barang?id_penitipan=${id_penitipan}&id_nota_penitipan=${id_nota_penitipan}`);
    }, 1000);

    setIdNotaPenitipanState(id_nota_penitipan);
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    setError("Gagal menyimpan data. Pastikan semua field sudah benar.");
    toast.error("Gagal menyimpan data.", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

const handleBack = async () => {
  if (idPenitipan) {
    const confirmDelete = window.confirm("Apakah Anda ingin membatalkan dan menghapus data penitipan yang sudah dibuat?");
    if (confirmDelete) {
      try {
        await deletePenitipanBarang(idPenitipan);
      } catch (err) {
        console.error("Gagal menghapus penitipan:", err);
      }
      navigate(-1);
    }
  } else {
    navigate(-1);
  }
};

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex flex-column align-items-center my-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Memuat data penitipan, mohon tunggu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: 700 }}>
      <div className="d-flex align-items-center mb-4">
        <button
          type="button"
          className="btn btn-outline-success me-3"
          onClick={handleBack}
        >
          ← Kembali
        </button>
        <h2 className="fw-bold mb-0">Form Penitipan Barang</h2>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm p-4">
        <div className="alert alert-warning" role="alert">
          <strong>Perhatian:</strong> Pastikan Data Penitip dan Petugas QC sudah sesuai sebelum menyimpan.
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label fw-semibold">Penitip</label>
              <select
                className="form-control"
                name="id_penitip"
                value={formData.id_penitip}
                onChange={handleChange}
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
                className="form-control"
                name="tanggal_awal_penitipan"
                value={formData.tanggal_awal_penitipan}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tanggal Akhir Penitipan</label>
              <input
                type="datetime-local"
                className="form-control"
                name="tanggal_akhir_penitipan"
                value={formData.tanggal_akhir_penitipan}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-semibold">Petugas QC (Pegawai Gudang)</label>
              <select
                className="form-control"
                name="nama_petugas_qc"
                value={formData.nama_petugas_qc}
                onChange={handleChange}
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
                value={formData.id_pegawai}
                onChange={handleChange}
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
          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-success px-4 py-2 fw-semibold">
              Simpan dan Tambah Barang
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PenitipanBarangForm;