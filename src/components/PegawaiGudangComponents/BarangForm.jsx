import React, { useState, useEffect } from "react";
import { getAllKategori } from "../../api/KategoriBarangApi";
import { createBarang } from "../../api/BarangApi";
import { uploadFotoBarang } from "../../api/FotoBarangApi";
import { createNotaDetailPenitipanBarang } from "../../api/NotaDetailPenitipanApi";
import { useSearchParams, useNavigate } from "react-router-dom";

const BarangForm = ({ initialData = null }) => {
  const emptyBarang = {
    id_barang: null,
    id_kategori: "",
    nama_barang: "",
    deskripsi: "",
    harga: "",
    masa_garansi: "",
    berat: "",
    rating: 0,
    status_barang: "Aktif",
    files: [],
  };

  const [searchParams] = useSearchParams();
  const idPenitipan = searchParams.get("id_penitipan");
  const idNotaPenitipan = searchParams.get("id_nota_penitipan");
  const navigate = useNavigate();

  const [kategoriList, setKategoriList] = useState([]);
  const [barang, setBarang] = useState(initialData || { ...emptyBarang });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await getAllKategori();
        setKategoriList(res || []);
      } catch (error) {
        console.error("Gagal fetch kategori:", error);
      }
    };
    fetchKategori();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setBarang((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    setBarang((prev) => ({
      ...prev,
      files: Array.from(e.target.files),
    }));
  };

  const resetForm = () => {
    setBarang({ ...emptyBarang });
    setSubmitted(false);
    setError(null);
  };

  if (!idPenitipan || !idNotaPenitipan) {
    return (
      <div className="alert alert-warning text-center">
        Silakan isi dan submit form Penitipan dan Nota Penitipan terlebih dahulu.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const barangDataToSend = {
        id_penitipan: idPenitipan,
        id_kategori: barang.id_kategori,
        nama_barang: barang.nama_barang,
        deskripsi: barang.deskripsi,
        harga: barang.harga,
        masa_garansi: barang.masa_garansi,
        berat: barang.berat,
        status_barang: barang.status_barang,
      };

      const resCreate = await createBarang(barangDataToSend);
      const newBarang = resCreate.data;

      for (const file of barang.files) {
        const formData = new FormData();
        formData.append("id_barang", newBarang.id_barang);
        formData.append("foto", file);
        await uploadFotoBarang(formData);
      }

      if (idNotaPenitipan) {
        const detailData = {
          id_nota_penitipan: idNotaPenitipan,
          nama_barang: newBarang.nama_barang,
          harga_barang: newBarang.harga,
          berat_pengajuan: newBarang.berat,
          status_garansi: newBarang.masa_garansi,
        };

        await createNotaDetailPenitipanBarang(detailData);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Gagal menyimpan data barang dan foto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8f9fa",
        padding: "1.5rem 1rem",
        boxSizing: "border-box",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <button
        type="button"
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
        style={{ fontWeight: "600" }}
      >
        ← Kembali
      </button>

      <h3 className="fw-bold mb-4 text-center">Form Barang Penitipan</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <fieldset
            style={{
              marginBottom: "2rem",
              padding: "1rem 1.5rem",
              border: "1px solid #ddd",
              borderRadius: 6,
              backgroundColor: "#fff",
            }}
            disabled={loading}
          >
            <legend className="fw-semibold">Barang</legend>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem 2rem",
              }}
            >
              <div className="form-group">
                <label className="form-label fw-semibold" htmlFor="nama_barang">
                  Nama Barang <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="nama_barang"
                  name="nama_barang"
                  className="form-control"
                  value={barang.nama_barang}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label className="form-label fw-semibold" htmlFor="id_kategori">
                  Kategori Barang <span className="text-danger">*</span>
                </label>
                <select
                  id="id_kategori"
                  name="id_kategori"
                  className="form-select"
                  value={barang.id_kategori}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList.map((kat) => (
                    <option key={kat.id_kategori} value={kat.id_kategori}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label fw-semibold" htmlFor="deskripsi">
                  Deskripsi Barang
                </label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  className="form-control"
                  value={barang.deskripsi}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label fw-semibold" htmlFor="harga">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  id="harga"
                  name="harga"
                  className="form-control"
                  value={barang.harga}
                  onChange={handleChange}
                  min={0}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label className="form-label fw-semibold" htmlFor="masa_garansi">
                  Masa Garansi
                </label>
                <input
                  type="date"
                  id="masa_garansi"
                  name="masa_garansi"
                  className="form-control"
                  value={barang.masa_garansi}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label fw-semibold" htmlFor="berat">
                  Berat (gram)
                </label>
                <input
                  type="number"
                  id="berat"
                  name="berat"
                  className="form-control"
                  value={barang.berat}
                  onChange={handleChange}
                  min={0}
                  autoComplete="off"
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label fw-semibold" htmlFor="files">
                  Upload Foto Barang
                </label>
                <input
                  type="file"
                  id="files"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {barang.files.length > 0 && (
                  <ul className="mt-2" style={{ maxHeight: 100, overflowY: "auto" }}>
                    {barang.files.map((file, i) => (
                      <li key={i} style={{ fontSize: 14 }}>
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label fw-semibold" htmlFor="status_barang">
                  Status Barang
                </label>
                <select
                  id="status_barang"
                  name="status_barang"
                  className="form-select"
                  value={barang.status_barang}
                  onChange={handleChange}
                >
                  <option value="Aktif">Aktif</option>
                </select>
              </div>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Barang"}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4 fs-5 fw-semibold text-success">
            Data barang berhasil disimpan!
          </p>
          <button className="btn btn-outline-primary me-3" onClick={resetForm}>
            Tambah Barang Lagi
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              navigate(`/pegawaiGudang/nota-penitipan/print?id_nota_penitipan=${idNotaPenitipan}`);
            }}
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
};

export default BarangForm;