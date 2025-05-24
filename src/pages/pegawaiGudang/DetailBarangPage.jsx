import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBarangById, updateBarang } from '../../api/BarangApi';
import { getFotoBarangByIdBarang, uploadFotoBarang, deleteFotoBarang } from '../../api/FotoBarangApi';
import { getAllKategori } from "../../api/KategoriBarangApi";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'harga' || name === 'berat' || name === 'id_kategori') ? Number(value) : value
    }));
  };

  const handleUpdate = async () => {
    try {
      await updateBarang(id, formData);
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
      alert('Barang berhasil diperbarui!');
      setBarang(formData);
      setEditMode(false);
      setNewPhotos([]);
      setDeletedPhotos([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui barang.');
    }
  };

  const handleCancel = () => {
    setFormData(barang);
    setEditMode(false);
  };

  const handleFotoUpload = (files) => {
    const selectedFiles = Array.from(files);
    setNewPhotos(prev => [...prev, ...selectedFiles]);
  };

  const handleDeleteFoto = (fotoId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
      setDeletedPhotos(prev => [...prev, fotoId]);
      setFotoBarang(prev => prev.filter(foto => foto.id_foto_barang !== fotoId));
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
                    src={`http://127.0.0.1:8000/${foto.url_foto || foto.url}`}
                    alt={`Foto ${barang.nama_barang} ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  />
                  {/* Tombol hapus hanya di edit mode */}
                  {editMode && (
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      style={{ zIndex: 2 }}
                      onClick={() => handleDeleteFoto(foto.id_foto_barang)}
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
                  <button className="btn btn-success" onClick={handleUpdate}>
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
              <h5>Informasi Penitipan</h5>
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
              <h6 className="fw-bold">Masa Penitipan</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tanggal Awal Penitipan:</label>
                <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.tanggal_awal_penitipan || '-'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tanggal Akhir Penitipan:</label>
                <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.tanggal_akhir_penitipan || '-'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nama Petugas QC:</label>
                <p className="border p-2 rounded bg-light">{barang.penitipan_barang?.nama_petugas_qc || '-'}</p>
              </div>
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
                <p className="border p-2 rounded bg-light">{barang.detail_transaksi?.transaksi?.tanggal_transaksi || '-'}</p>
              </div>
            </>
          )}

          {activeTab === 'donasi' && (barang.status_barang === 'Barang untuk donasi' || barang.status_barang === 'Barang sudah Didonasikan') && (
            <>
              <h5>Informasi Donasi</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tanggal Donasi:</label>
                <p className="border p-2 rounded bg-light">{barang.alokasi_donasi.tanggal_donasi || '-'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Organisasi yang Menerima:</label>
                <p className="border p-2 rounded bg-light">{barang.alokasi_donasi?.request_donasi?.organisasi?.nama_organisasi || '-'}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailBarangPage;