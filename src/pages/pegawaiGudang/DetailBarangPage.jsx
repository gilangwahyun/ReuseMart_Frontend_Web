import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../api/index";
import { useParams, useNavigate } from 'react-router-dom';
import { getBarangById, updateBarang } from '../../api/BarangApi';
import { getFotoBarangByIdBarang, uploadFotoBarang, deleteFotoBarang, updateFotoBarang } from '../../api/fotoBarangApi';
import { getAllKategori } from "../../api/KategoriBarangApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PegawaiGudangSidebar from '../../components/PegawaiGudangSidebar';

const DetailBarangPage = ({ isEditMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [barang, setBarang] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [fotoBarang, setFotoBarang] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState('detail'); // tab aktif
  const [tanpaGaransi, setTanpaGaransi] = useState(false);
  const [fotoError, setFotoError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fungsi formatter tanggal dan waktu
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // Fungsi formatter hanya tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchData = async () => {
    try {
      const data = await getBarangById(id);
      if (!data) {
        setError('Barang tidak ditemukan');
        setLoading(false);
        return;
      }

      setBarang(data);
      setFormData({
        ...data,
        id_kategori: data.kategori?.id_kategori || '',
      });

      const fotos = await getFotoBarangByIdBarang(id);
      console.log(fotos);
      setFotoBarang(fotos || []);

      const kategoriData = await getAllKategori();
      setKategoriList(kategoriData || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    // Set tanpaGaransi sesuai data barang saat masuk edit mode
    if (editMode) {
      setTanpaGaransi(!formData.masa_garansi);
    }
    // eslint-disable-next-line
  }, [editMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'harga' || name === 'berat' || name === 'id_kategori') ? Number(value) : value
    }));
  };

  const handleTanpaGaransi = (e) => {
    setTanpaGaransi(e.target.checked);
    if (e.target.checked) {
      setFormData(prev => ({ ...prev, masa_garansi: '' }));
    }
  };

  const handleUpdateClick = () => {
    // Validasi minimal 2 foto
    const fotoLamaTersisa = fotoBarang.filter(f => !deletedPhotos.includes(f.id_foto_barang));
    const totalFoto = fotoLamaTersisa.length + newPhotos.length;
    if (totalFoto < 2) {
      setFotoError('Minimal harus ada 2 foto per barang!');
      return;
    }
    setFotoError(null);
    // Tampilkan modal konfirmasi
    setShowConfirmModal(true);
  };

  const handleUpdate = async () => {
    try {
      setShowConfirmModal(false);
      const dataToSend = {
        ...formData,
        masa_garansi: tanpaGaransi ? null : formData.masa_garansi,
      };
      await updateBarang(id, dataToSend);
      // Proses hapus foto
      for (const fotoId of deletedPhotos) {
        await deleteFotoBarang(fotoId);
      }
      // Proses upload foto baru
      for (const file of newPhotos) {
        const formDataFoto = new FormData();
        formDataFoto.append('id_barang', id);
        formDataFoto.append('foto', file);
        await uploadFotoBarang(formDataFoto);
      }
      toast.success('Barang berhasil diperbarui!');
      setBarang(formData);
      setEditMode(false);
      setNewPhotos([]);
      setDeletedPhotos([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui barang.');
    }
  };

  const handleCancel = () => {
    setFormData(barang);
    setEditMode(false);
  };

  const handleFotoUpload = (files) => {
    const selectedFiles = Array.from(files);
    setNewPhotos(prev => [...prev, ...selectedFiles]);
    setFotoError(null);
  };

  const handleDeleteFoto = (fotoId, isThumbnail) => {
    if (isThumbnail === "1") {
      toast.warning('Foto ini adalah thumbnail. Pilih thumbnail baru sebelum menghapus foto ini.');
      return;
    }
    // Hitung total foto setelah dihapus
    const fotoLamaTersisa = fotoBarang.filter(f => f.id_foto_barang !== fotoId && !deletedPhotos.includes(f.id_foto_barang));
    const totalFotoSetelahHapus = fotoLamaTersisa.length + newPhotos.length;
    if (totalFotoSetelahHapus < 2) {
      setFotoError('Minimal harus ada 2 foto per barang!');
      return;
    }
    setFotoError(null);
    if (window.confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
      setDeletedPhotos(prev => [...prev, fotoId]);
      setFotoBarang((prev) => prev.filter((f) => f.id_foto_barang !== fotoId));
    }
  };

  const handleSetThumbnail = async (id_foto_barang) => {
    try {
      // Set semua foto is_thumbnail = false, lalu foto terpilih = true
      // Backend harus handle logic ini, tapi untuk sekarang, update satu per satu
      // (atau bisa buat endpoint khusus di backend untuk set thumbnail)
      await updateFotoBarang(id_foto_barang, { is_thumbnail: true });
      // Setelah update, reload foto
      const fotos = await getFotoBarangByIdBarang(id);
      setFotoBarang(fotos || []);
      toast.success('Thumbnail berhasil diubah');
    } catch (err) {
      toast.error('Gagal mengubah thumbnail');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center my-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Sedang memuat detail barang, mohon tunggu...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center mt-5">{error}</p>;
  }

  if (!barang) {
    return <p className="text-center text-danger mt-5">Barang tidak ditemukan.</p>;
  }

  return (
    <div className="d-flex">
      <PegawaiGudangSidebar />
      <div className="container my-5">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-success me-3" onClick={() => navigate(-1)}>
            ← Kembali
          </button>
          <h2>{editMode ? 'Edit Detail Barang' : 'Detail Barang'}</h2>

          {!editMode && (
            <button className="btn btn-warning ms-auto" onClick={() => setEditMode(true)}>
              ✏️ Edit
            </button>
          )}
        </div>

      <div className="row">
        {/* Kolom Foto */}
        <div className="col-md-4 mb-4">
          {/* Foto Barang */}
          {fotoBarang.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {fotoBarang.map((foto, idx) => (
                <div key={foto.id_foto_barang || idx} className="position-relative mb-2">
                  <img
                    src={`${BASE_URL}${foto.url_foto || foto.url}`}
                    alt={`Foto ${barang.nama_barang} ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      border: foto.is_thumbnail === "1" ? '3px solid #198754' : '1px solid #ddd',
                    }}
                  />
                  {/* Badge Thumbnail */}
                  {foto.is_thumbnail === "1" && (
                    <span className="badge bg-success position-absolute top-0 start-0 m-2">Thumbnail</span>
                  )}
                  {/* Tombol jadikan thumbnail */}
                  {foto.is_thumbnail !== "1" && (
                    <button
                      className="btn btn-sm btn-outline-success position-absolute top-0 end-0 m-1"
                      style={{ zIndex: 2 }}
                      onClick={() => handleSetThumbnail(foto.id_foto_barang)}
                      title="Jadikan Thumbnail"
                    >
                      Jadikan Thumbnail
                    </button>
                  )}
                  {/* Tombol hapus hanya di edit mode dan bukan thumbnail */}
                  {editMode && foto.is_thumbnail !== "1" && (
                    <button
                      className="btn btn-sm btn-danger position-absolute bottom-0 end-0 m-1"
                      style={{ zIndex: 2 }}
                      onClick={() => handleDeleteFoto(foto.id_foto_barang, foto.is_thumbnail)}
                      title="Hapus foto"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <img
              src="/assets/logoReuseMart.png"
              alt="Foto tidak tersedia"
              className="img-fluid rounded"
              style={{ height: '180px', objectFit: 'cover' }}
            />
          )}

            {/* Input upload foto hanya di edit mode, di bawah foto */}
            {editMode && (
              <div className="mt-3">
                <label className="form-label fw-semibold">Upload Foto Baru:</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-control"
                  onChange={(e) => handleFotoUpload(e.target.files)}
                />
                {fotoError && (
                  <div className="text-danger mt-2" style={{ fontSize: 14 }}>{fotoError}</div>
                )}
                {newPhotos.length > 0 && (
                  <div className="row mt-2 g-2">
                    {newPhotos.map((file, i) => (
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
                          onClick={() => setNewPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          title="Hapus foto baru"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {newPhotos.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">{newPhotos.length} foto baru akan diupload</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Kolom Detail dengan Tab */}
          <div className="col-md-8">
            {/* Tab Menu */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link text-success ${activeTab === 'detail' ? 'active text-success fw-bold' : ''}`}
                  onClick={() => setActiveTab('detail')}
                >
                  Detail Barang
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-success${activeTab === 'penitipan' ? 'active text-success fw-bold' : ''}`}
                  onClick={() => setActiveTab('penitipan')}
                >
                  Info Penitipan
                </button>
              </li>
              {/* Info Transaksi hanya tampil jika status_barang === 'Habis' dan status_transaksi === 'Lunas' */}
              {(barang.status_barang === 'Habis' && barang.detail_transaksi?.transaksi?.status_transaksi === 'Lunas') && (
                <li className="nav-item">
                  <button
                    className={`nav-link text-success ${activeTab === 'transaksi' ? 'active text-success fw-bold' : ''}`}
                    onClick={() => setActiveTab('transaksi')}
                  >
                    Info Transaksi
                  </button>
                </li>
              )}

              {/* Info Donasi tampil jika status_barang adalah 'Barang untuk donasi' atau 'Barang sudah Didonasikan' */}
              {(barang.status_barang === 'Barang untuk donasi' || barang.status_barang === 'Barang sudah Didonasikan') && (
                <li className="nav-item">
                  <button
                    className={`nav-link text-success ${activeTab === 'donasi' ? 'active text-success fw-bold' : ''}`}
                    onClick={() => setActiveTab('donasi')}
                  >
                    Info Donasi
                  </button>
                </li>
              )}
            </ul>

            {/* Konten Tab */}
            {activeTab === 'detail' && (
              <>
                {/* Nama Barang */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nama Barang:</label>
                  {editMode ? (
                    <input
                      type="text"
                      className="form-control"
                      name="nama_barang"
                      value={formData.nama_barang || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="border p-2 rounded bg-light">{barang.nama_barang}</p>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Deskripsi:</label>
                  {editMode ? (
                    <textarea
                      className="form-control"
                      name="deskripsi"
                      value={formData.deskripsi || ''}
                      onChange={handleChange}
                      rows={4}
                    />
                  ) : (
                    <p className="border p-2 rounded bg-light">{barang.deskripsi}</p>
                  )}
                </div>

                {/* Harga */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Harga:</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="form-control"
                      name="harga"
                      value={formData.harga || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="border p-2 rounded bg-light">
                      Rp {barang.harga.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                {/* Berat */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Berat (gram):</label>
                  {editMode ? (
                    <input
                      type="number"
                      className="form-control"
                      name="berat"
                      value={formData.berat || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="border p-2 rounded bg-light">{barang.berat} gram</p>
                  )}
                </div>

                {/* Status Garansi */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status Garansi:</label>
                  {editMode ? (
                    <>
                      <input
                        type="date"
                        className="form-control mb-2"
                        name="masa_garansi"
                        value={formData.masa_garansi ? formData.masa_garansi.substring(0, 10) : ''}
                        onChange={handleChange}
                        disabled={tanpaGaransi}
                      />
                      <div className="form-check mt-1">
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
                    </>
                  ) : (
                    <p className="border p-2 rounded bg-light">
                      {barang.masa_garansi ? formatDate(barang.masa_garansi) : 'Tidak ada garansi'}
                    </p>
                  )}
                </div>

                {/* Status Barang */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status Barang:</label>
                  {editMode ? (
                    <select
                      className="form-select"
                      name="status_barang"
                      value={formData.status_barang || ''}
                      onChange={handleChange}
                    >
                      <option value="">-- Pilih status --</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Non Aktif">Non Aktif</option>
                      <option value="Habis">Habis</option>
                      <option value="Barang untuk Donasi">Barang untuk Donasi</option>
                      <option value="Barang sudah Didonasikan">Barang sudah Didonasikan</option>
                    </select>
                  ) : (
                    <p className="border p-2 rounded bg-light">{barang.status_barang}</p>
                  )}
                </div>

                {/* Kategori */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Kategori:</label>
                  {editMode ? (
                    <select
                      className="form-select"
                      name="id_kategori"
                      value={formData.id_kategori || ''}
                      onChange={handleChange}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {kategoriList.map((kat) => (
                        <option key={kat.id_kategori} value={kat.id_kategori}>
                          {kat.nama_kategori}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="border p-2 rounded bg-light">
                      {barang.kategori?.nama_kategori || '-'}
                    </p>
                  )}
                </div>

                {/* Tombol Simpan / Batal */}
                {editMode && (
                  <div className="d-flex gap-3">
                    <button className="btn btn-success" onClick={handleUpdateClick}>
                      💾 Simpan Perubahan
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                      ❌ Batal
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'penitipan' && (
              <>
                <h6 className="fw-bold">Informasi Penitip</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nama Penitip:</label>
                  <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.penitip?.nama_penitip || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Penitip:</label>
                  <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.penitip?.user?.email || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Kontak Penitip:</label>
                  <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.penitip?.no_telepon || '-'}</p>
                </div>
                <hr />
                <h6 className="fw-bold">Informasi Penitipan</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tanggal Awal Penitipan:</label>
                  <p className="border p-2 rounded bg-light">
                    {formatDateTime(barang.penitipan_barang?.tanggal_awal_penitipan)}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tanggal Akhir Penitipan:</label>
                  <p className="border p-2 rounded bg-light">
                    {formatDateTime(barang.penitipan_barang?.tanggal_akhir_penitipan)}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nama Petugas QC:</label>
                  <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.nama_petugas_qc || '-'}</p>
                </div>
                
                {/* Informasi Hunter */}
                {barang.penitipan_barang?.pegawai && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Hunter:</label>
                    <p className="border p-2 rounded bg-light">
                      {barang.penitipan_barang?.pegawai?.nama_pegawai} (ID: {barang.penitipan_barang?.pegawai?.id_pegawai})
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'transaksi' && (barang.status_barang === 'Habis' && barang.detail_transaksi?.transaksi?.status_transaksi === 'Lunas') && (
              <>
                <h5>Informasi Transaksi</h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status Pembayaran:</label>
                  <p className="border p-2 rounded bg-light">{barang.detail_transaksi?.transaksi?.status_transaksi || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tanggal Transaksi:</label>
                  <p className="border p-2 rounded bg-light">
                    {formatDateTime(barang.detail_transaksi?.transaksi?.tanggal_transaksi)}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Rating Pembeli:</label>
                  <p className="border p-2 rounded bg-light">{(barang.rating)}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'donasi' && (barang.status_barang === 'Barang untuk donasi' || barang.status_barang === 'Barang sudah Didonasikan') && (
              <>
                <h5>Informasi Donasi</h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tanggal Donasi:</label>
                  <p className="border p-2 rounded bg-light">
                    {formatDateTime(barang.alokasi_donasi?.tanggal_donasi)}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Organisasi yang Menerima:</label>
                  <p className="border p-2 rounded bg-light">{barang.alokasi_donasi?.request_donasi?.organisasi?.nama_organisasi || '-'}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Toast Container */}
        <ToastContainer position="top-center" autoClose={3000} />
        
        {/* Modal Konfirmasi */}
        {showConfirmModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Konfirmasi Perubahan</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Apakah Anda yakin ingin menyimpan perubahan pada data barang ini?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Tidak</button>
                  <button type="button" className="btn btn-success" onClick={handleUpdate}>Ya, Simpan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailBarangPage;