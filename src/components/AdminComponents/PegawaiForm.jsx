import React, { useState, useEffect } from 'react';
import { getAllJabatan } from '../../api/JabatanApi';

const PegawaiForm = ({ onSubmit, onClose, initialData = {}, loading }) => {
  const [data, setData] = useState({
    email: '',
    password: '',
    nama_pegawai: '',
    tanggal_lahir: '',
    no_telepon: '',
    alamat: '',
    id_jabatan: '',
  });
  const [jabatanList, setJabatanList] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Set initial data saat form edit
    if (initialData?.id_user) {
      setData(prev => ({
        ...prev,
        email: initialData.user?.email || '',
        nama_pegawai: initialData.nama_pegawai || '',
        tanggal_lahir: initialData.tanggal_lahir || '',
        no_telepon: initialData.no_telepon || '',
        alamat: initialData.alamat || '',
        id_jabatan: initialData.id_jabatan || '',
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchJabatan = async () => {
      try {
        const res = await getAllJabatan();
        setJabatanList(res.data);
      } catch (err) {
        console.error("Gagal memuat jabatan", err);
      }
    };
    fetchJabatan();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!data.email) newErrors.email = 'Email wajib diisi.';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email))
      newErrors.email = 'Format email tidak valid.';
    if (!data.password && !initialData.id_user) newErrors.password = 'Password wajib diisi.';
    if (!data.nama_pegawai) newErrors.nama_pegawai = 'Nama pegawai wajib diisi.';
    if (!data.tanggal_lahir) newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi.';
    if (!data.no_telepon) newErrors.no_telepon = 'No. telepon wajib diisi.';
    if (!data.alamat) newErrors.alamat = 'Alamat wajib diisi.';
    if (!data.id_jabatan) newErrors.id_jabatan = 'Jabatan wajib dipilih.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            name="email"
            value={data.email}
            onChange={handleChange}
            readOnly={initialData.id_user}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            name="password"
            value={data.password}
            onChange={handleChange}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Nama Pegawai</label>
          <input
            type="text"
            name="nama_pegawai"
            className={`form-control ${errors.nama_pegawai ? 'is-invalid' : ''}`}
            value={data.nama_pegawai}
            onChange={handleChange}
          />
          {errors.nama_pegawai && <div className="invalid-feedback">{errors.nama_pegawai}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Tanggal Lahir</label>
          <input
            type="date"
            name="tanggal_lahir"
            className={`form-control ${errors.tanggal_lahir ? 'is-invalid' : ''}`}
            value={data.tanggal_lahir}
            onChange={handleChange}
          />
          {errors.tanggal_lahir && <div className="invalid-feedback">{errors.tanggal_lahir}</div>}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">No. Telepon</label>
          <input
            type="text"
            name="no_telepon"
            className={`form-control ${errors.no_telepon ? 'is-invalid' : ''}`}
            value={data.no_telepon}
            onChange={handleChange}
          />
          {errors.no_telepon && <div className="invalid-feedback">{errors.no_telepon}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Alamat</label>
          <textarea
            name="alamat"
            className={`form-control ${errors.alamat ? 'is-invalid' : ''}`}
            value={data.alamat}
            onChange={handleChange}
            rows="3"
          />
          {errors.alamat && <div className="invalid-feedback">{errors.alamat}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Jabatan</label>
        <select
          name="id_jabatan"
          className={`form-select ${errors.id_jabatan ? 'is-invalid' : ''}`}
          value={data.id_jabatan}
          onChange={handleChange}
        >
          <option value="">Pilih Jabatan</option>
          {jabatanList.map(j => (
            <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>
          ))}
        </select>
        {errors.id_jabatan && <div className="invalid-feedback">{errors.id_jabatan}</div>}
      </div>

      <div className="text-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Memproses...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

export default PegawaiForm;