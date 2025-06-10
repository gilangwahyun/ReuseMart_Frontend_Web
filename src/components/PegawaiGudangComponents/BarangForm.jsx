import React, { useState, useEffect } from "react";
import { getAllKategori } from "../../api/KategoriBarangApi";
import { createBarang } from "../../api/BarangApi";
// import { uploadFotoBarang } from "../../api/FotoBarangApi";
import { createNotaDetailPenitipanBarang } from "../../api/NotaDetailPenitipanApi";
import { useSearchParams, useNavigate } from "react-router-dom";
import { deletePenitipanBarang } from "../../api/PenitipanBarangApi";

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
  const [tanpaGaransi, setTanpaGaransi] = useState(false);

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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const handlePopState = async (e) => {
      if (!barang.id_barang && idPenitipan) {
        const confirmDelete = window.confirm("Apakah Anda ingin membatalkan dan menghapus data penitipan yang sudah dibuat?");
        if (confirmDelete) {
          try {
            await deletePenitipanBarang(idPenitipan);
          } catch (err) {
            // Tidak perlu alert, cukup log
            console.error("Gagal menghapus penitipan:", err);
          }
          navigate(-1);
        } else {
          // Jika batal, dorong lagi ke halaman ini
          window.history.pushState(null, '', window.location.href);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [idPenitipan, barang.id_barang, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setBarang((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleTanpaGaransi = (e) => {
    setTanpaGaransi(e.target.checked);
    if (e.target.checked) {
      setBarang((prev) => ({ ...prev, masa_garansi: "" }));
    }
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
        masa_garansi: tanpaGaransi ? null : barang.masa_garansi,
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
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center mb-4">
        <button
          type="button"
          className="btn btn-outline-success me-3"
          onClick={async () => {
            if (!barang.id_barang && idPenitipan) {
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
          }}
          style={{ fontWeight: "600" }}
        >
          ← Kembali
        </button>
        <h3 className="fw-bold mb-0">Form Barang Penitipan</h3>
      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="card shadow-sm p-4">
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <fieldset
              style={{
                marginBottom: "2rem",
                padding: 0,
                border: "none",
                backgroundColor: "transparent",
              }}
              disabled={loading}
            >
              <legend className="fw-semibold mb-3">Barang</legend>
              <div className="row g-3">
                <div className="col-md-6">
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
                <div className="col-md-6">
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
                <div className="col-md-12">
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
                <div className="col-md-4">
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
                <div className="col-md-4">
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
                    disabled={tanpaGaransi}
                  />
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="tanpaGaransi"
                      checked={tanpaGaransi}
                      onChange={handleTanpaGaransi}
                    />
                    <label className="form-check-label" htmlFor="tanpaGaransi">
                      Barang tidak memiliki garansi
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
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
                <div className="col-md-12">
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
                <div className="col-md-12">
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
            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Barang"}
              </button>
            </div>
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
    </div>
  );
};

export default BarangForm;