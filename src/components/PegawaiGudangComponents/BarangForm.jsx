import React, { useState, useEffect } from "react";
import { getAllKategori } from "../../api/KategoriBarangApi";
import { createBarang } from "../../api/BarangApi";
import { uploadFotoBarang } from "../../api/FotoBarangApi";
import { createNotaDetailPenitipanBarang } from "../../api/NotaDetailPenitipanApi";
import { useSearchParams, useNavigate } from "react-router-dom";
import { deletePenitipanBarang } from "../../api/PenitipanBarangApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [fotoError, setFotoError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [garansiDisplay, setGaransiDisplay] = useState('');

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await getAllKategori();
        setKategoriList(res || []);
      } catch (error) {
        console.error("Gagal fetch kategori:", error);
        toast.error("Gagal memuat data kategori");
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
        setShowConfirmDeleteModal(true);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [idPenitipan, barang.id_barang, navigate]);

  const handleDeletePenitipan = async () => {
    try {
      await deletePenitipanBarang(idPenitipan);
      toast.info("Data penitipan telah dibatalkan");
      navigate(-1);
    } catch (err) {
      console.error("Gagal menghapus penitipan:", err);
      toast.error("Gagal menghapus data penitipan");
    }
    setShowConfirmDeleteModal(false);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setBarang((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    // Update tampilan tanggal garansi
    if (name === 'masa_garansi' && value) {
      setGaransiDisplay(formatDate(value));
    }
  };

  const handleTanpaGaransi = (e) => {
    setTanpaGaransi(e.target.checked);
    if (e.target.checked) {
      setBarang((prev) => ({ ...prev, masa_garansi: "" }));
      setGaransiDisplay('');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setBarang((prev) => ({
      ...prev,
      files,
    }));
    if (files.length < 2) {
      setFotoError('Minimal upload 2 foto barang!');
    } else {
      setFotoError(null);
    }
  };

  const handleRemoveFile = (index) => {
    setBarang((prev) => {
      const newFiles = prev.files.filter((_, i) => i !== index);
      if (newFiles.length < 2) {
        setFotoError('Minimal upload 2 foto barang!');
      }
      return { ...prev, files: newFiles };
    });
  };

  const resetForm = () => {
    setBarang({ ...emptyBarang });
    setSubmitted(false);
    setError(null);
    setGaransiDisplay('');
    toast.success("Form telah direset, silakan tambah barang baru");
  };

  if (!idPenitipan || !idNotaPenitipan) {
    return (
      <div className="alert alert-warning text-center">
        Silakan isi dan submit form Penitipan dan Nota Penitipan terlebih dahulu.
      </div>
    );
  }

  const handleSubmitClick = (e) => {
    e.preventDefault();
    
    if (barang.files.length < 2) {
      setFotoError('Minimal upload 2 foto barang!');
      toast.warning('Minimal upload 2 foto barang!');
      return;
    }
    setFotoError(null);
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    setShowConfirmModal(false);
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

      toast.success("Data barang berhasil disimpan!");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Gagal menyimpan data barang dan foto.");
      toast.error("Gagal menyimpan data barang");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (!barang.id_barang && idPenitipan) {
      setShowConfirmDeleteModal(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center mb-4">
        <button
          type="button"
          className="btn btn-outline-success me-3"
          onClick={handleBackClick}
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
          <form onSubmit={handleSubmitClick}>
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
                  {garansiDisplay && (
                    <div className="form-text text-dark fw-medium mt-1">
                      {garansiDisplay}
                    </div>
                  )}
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
                  {fotoError && (
                    <div className="text-danger mt-1" style={{ fontSize: 14 }}>{fotoError}</div>
                  )}
                  {barang.files.length > 0 && (
                    <div className="row mt-2 g-2">
                      {barang.files.map((file, i) => (
                        <div className="col-auto position-relative" key={i} style={{ width: 100 }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #ccc' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ zIndex: 2, padding: '2px 6px', fontSize: 12 }}
                            onClick={() => handleRemoveFile(i)}
                            title="Hapus foto"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
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
                toast.info("Mengarahkan ke halaman nota penitipan...");
                navigate(`/pegawaiGudang/nota-penitipan/print?id_nota_penitipan=${idNotaPenitipan}`);
              }}
            >
              Selesai
            </button>
          </div>
        )}
      </div>
      
      {/* Modal Konfirmasi Simpan */}
      {showConfirmModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Konfirmasi Simpan Barang</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Apakah Anda yakin ingin menyimpan data barang ini?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Tidak</button>
                <button type="button" className="btn btn-success" onClick={handleSubmit}>Ya, Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Penitipan */}
      {showConfirmDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Konfirmasi Batalkan Penitipan</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Apakah Anda yakin ingin membatalkan dan menghapus data penitipan yang sudah dibuat?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmDeleteModal(false)}>Tidak</button>
                <button type="button" className="btn btn-danger" onClick={handleDeletePenitipan}>Ya, Batalkan</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default BarangForm;