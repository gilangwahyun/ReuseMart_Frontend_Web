import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPenitipanBarang } from "../../api/PenitipanBarangApi";
import { getAllPenitip, getPenitipById } from "../../api/PenitipApi";
import { getAllPegawai } from "../../api/PegawaiApi";
import { getAllJabatan } from "../../api/JabatanApi";
import { createNotaPenitipanBarang } from "../../api/NotaPenitipanBarangApi";
import { ToastContainer, toast } from "react-toastify";

const PenitipanBarangForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_penitip: "",
    tanggal_awal_penitipan: "",
    tanggal_akhir_penitipan: "",
    nama_petugas_qc: "",
  });

  const [penitipList, setPenitipList] = useState([]);
  const [qcList, setQcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const filteredPegawai = pegawais.filter(
          (pegawai) => jabatanMap[pegawai.id_jabatan] === "Pegawai Gudang"
        );

        const formattedQC = filteredPegawai.map((pegawai) => ({
          label: `${pegawai.nama_pegawai} (ID: ${pegawai.id_pegawai})`,
          value: `${pegawai.nama_pegawai} (ID: ${pegawai.id_pegawai})`,
        }));

        setQcList(formattedQC);
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
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    setError("Gagal menyimpan data. Pastikan semua field sudah benar.");
    toast.error("Gagal menyimpan data.", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Form Penitipan Barang</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Pilih Penitip */}
        <div className="mb-3">
          <label className="form-label">Penitip</label>
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

        {/* Tanggal Awal (readonly) */}
        <div className="mb-3">
          <label className="form-label">Tanggal Awal Penitipan</label>
          <input
            type="datetime-local"
            className="form-control"
            name="tanggal_awal_penitipan"
            value={formData.tanggal_awal_penitipan}
            onChange={handleChange}
            readOnly
          />
        </div>

        {/* Tanggal Akhir (readonly) */}
        <div className="mb-3">
          <label className="form-label">Tanggal Akhir Penitipan</label>
          <input
            type="datetime-local"
            className="form-control"
            name="tanggal_akhir_penitipan"
            value={formData.tanggal_akhir_penitipan}
            onChange={handleChange}
            readOnly
          />
        </div>

        {/* Pilih Petugas QC */}
        <div className="mb-3">
          <label className="form-label">Petugas QC (Pegawai Gudang)</label>
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

        <button type="submit" className="btn btn-success">
          Simpan dan Tambah Barang
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default PenitipanBarangForm;