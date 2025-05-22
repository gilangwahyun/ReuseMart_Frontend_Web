import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBarangById, updateBarang } from '../../api/BarangApi';
import { getFotoBarangByIdBarang } from '../../api/FotoBarangApi';
import { getAllKategori } from "../../api/KategoriBarangApi";

const DetailBarangPage = ({ isEditMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [barang, setBarang] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [fotoBarang, setFotoBarang] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(isEditMode);

  useEffect(() => {
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
      alert('Barang berhasil diperbarui!');
      setBarang(formData); // perbarui data tampilan
      setEditMode(false);  // keluar dari mode edit
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui barang.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus barang ini?')) {
      try {
        await deleteBarang(id);
        alert('Barang berhasil dihapus!');
        navigate('/admin/barang');
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus barang.');
      }
    }
  };

  const handleCancel = () => {
    setFormData(barang);  // kembalikan ke data awal
    setEditMode(false);
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
        <div className="col-md-5 mb-4">
          {fotoBarang.length > 0 ? (
            <div className="d-flex flex-wrap gap-3">
              {fotoBarang.map((foto, idx) => (
                <img
                  key={foto.id_foto_barang || idx}
                  src={`http://127.0.0.1:8000/${foto.url_foto || foto.url}`}
                  alt={`Foto ${barang.nama_barang} ${idx + 1}`}
                  style={{
                    width: '48%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                />
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
        </div>

        <div className="col-md-7">
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
                <option value="Barang untuk Donasi">Tidak Aktif</option>
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

          {/* Info Penitipan */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Tanggal Penitipan:</label>
            <p className="border p-2 rounded bg-light">
              {barang.penitipan_barang
                ? `${barang.penitipan_barang.tanggal_awal_penitipan} s/d ${barang.penitipan_barang.tanggal_akhir_penitipan}`
                : '-'}
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Nama Petugas QC:</label>
            <p className="border p-2 rounded bg-light">
              {barang.penitipan_barang?.nama_petugas_qc || '-'}
            </p>
          </div>

          {/* Info Penitip */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Nama Penitip:</label>
            <p className="border p-2 rounded bg-light">
              {barang.penitipan_barang?.penitip?.nama_penitip || '-'}
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email Penitip:</label>
            <p className="border p-2 rounded bg-light">
              {barang.penitipan_barang?.penitip?.user?.email || '-'}
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">No Telepon Penitip:</label>
            <p className="border p-2 rounded bg-light">
              {barang.penitipan_barang?.penitip?.no_telepon || '-'}
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Alamat Penitip:</label>
            <p className="border p-2 rounded bg-light">
              {barang.penitipan_barang?.penitip?.alamat || '-'}
            </p>
          </div>

          {editMode && (
            <div className="mt-4 d-flex justify-content-between">
              <div>
                <button className="btn btn-primary me-2" onClick={handleUpdate}>
                  💾 Simpan Perubahan
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  ❌ Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailBarangPage;