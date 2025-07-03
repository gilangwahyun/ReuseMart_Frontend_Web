import React, { useState, useEffect } from 'react';

const PenitipForm = ({ onSubmit, onClose, initialData = {}, loading }) => {
  const [data, setData] = useState({
    email: '',
    password: '',
    nama_penitip: '',
    nik: '',
    no_telepon: '',
    alamat: '',
    saldo: '',
    nominal_tarik: '',
    jumlah_poin: '',
    foto_ktp: null,
  });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Set initial data saat form edit
    if (initialData?.id_user) {
      setData(prev => ({
        ...prev,
        email: initialData.user?.email || '',
        nama_penitip: initialData.nama_penitip || '',
        nik: initialData.nik || '',
        no_telepon: initialData.no_telepon || '',
        alamat: initialData.alamat || '',
        saldo: initialData.saldo || '',
        nominal_tarik: initialData.nominal_tarik || '',
        jumlah_poin: initialData.jumlah_poin || '',
      }));

      // Jika ada foto KTP, tampilkan preview
      if (initialData.foto_ktp) {
        // Gunakan variabel lingkungan dengan sintaks Vite
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        setPreviewUrl(`${baseUrl}/${initialData.foto_ktp}`);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData(prev => ({ ...prev, foto_ktp: file }));
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.email) newErrors.email = 'Email wajib diisi.';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email))
      newErrors.email = 'Format email tidak valid.';
    if (!data.password && !initialData.id_user) newErrors.password = 'Password wajib diisi.';
    if (!data.nama_penitip) newErrors.nama_penitip = 'Nama penitip wajib diisi.';
    if (!data.nik) newErrors.nik = 'NIK wajib diisi.';
    else if (!/^\d{16}$/.test(data.nik))
      newErrors.nik = 'NIK harus terdiri dari 16 digit angka.';
    if (!data.no_telepon) newErrors.no_telepon = 'No. telepon wajib diisi.';
    if (!data.alamat) newErrors.alamat = 'Alamat wajib diisi.';
    if (!data.foto_ktp && !initialData.id_user) newErrors.foto_ktp = 'Foto KTP wajib diupload.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Buat FormData object untuk mengirim file
    const formData = new FormData();
    formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);
    formData.append('nama_penitip', data.nama_penitip);
    formData.append('nik', data.nik);
    formData.append('no_telepon', data.no_telepon);
    formData.append('alamat', data.alamat);
    
    // Explicitly ensure we're sending numeric values (even if empty)
    formData.append('saldo', data.saldo || '0');
    formData.append('nominal_tarik', data.nominal_tarik || '0');
    formData.append('jumlah_poin', data.jumlah_poin || '0');
    
    if (data.foto_ktp) formData.append('foto_ktp', data.foto_ktp);
    if (initialData.id_user) formData.append('id_user', initialData.id_user);

    // Debug log the form data
    console.log('Form data to be submitted:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? 'File object' : value}`);
    }

    onSubmit(formData);
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
          {initialData.id_user && (
            <small className="text-muted">Biarkan kosong jika tidak ingin mengubah password</small>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Nama Penitip</label>
          <input
            type="text"
            name="nama_penitip"
            className={`form-control ${errors.nama_penitip ? 'is-invalid' : ''}`}
            value={data.nama_penitip}
            onChange={handleChange}
          />
          {errors.nama_penitip && <div className="invalid-feedback">{errors.nama_penitip}</div>}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">NIK</label>
          <input
            type="text"
            name="nik"
            className={`form-control ${errors.nik ? 'is-invalid' : ''}`}
            value={data.nik}
            onChange={handleChange}
          />
          {errors.nik && <div className="invalid-feedback">{errors.nik}</div>}
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

      {initialData.id_user && (
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Saldo</label>
            <input
              type="number"
              name="saldo"
              className="form-control"
              value={data.saldo}
              onChange={handleChange}
            />
            <small className="text-muted">Saldo penitip saat ini</small>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Nominal Tarik</label>
            <input
              type="number"
              name="nominal_tarik"
              className="form-control"
              value={data.nominal_tarik}
              onChange={handleChange}
            />
            <small className="text-muted">Nominal penarikan terakhir</small>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Jumlah Poin</label>
            <input
              type="number"
              name="jumlah_poin"
              className="form-control"
              value={data.jumlah_poin}
              onChange={handleChange}
            />
            <small className="text-muted">Akumulasi poin penitip</small>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Foto KTP</label>
        <input
          type="file"
          name="foto_ktp"
          className={`form-control ${errors.foto_ktp ? 'is-invalid' : ''}`}
          onChange={handleFileChange}
          accept="image/*"
        />
        {errors.foto_ktp && <div className="invalid-feedback">{errors.foto_ktp}</div>}
        
        {previewUrl && (
          <div className="mt-2">
            <img src={previewUrl} alt="Preview KTP" className="img-thumbnail" style={{ maxHeight: '200px' }} />
          </div>
        )}
        
        <small className="text-muted d-block mt-1">
          Upload foto KTP untuk verifikasi identitas.
        </small>
      </div>

      <div className="text-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Memproses...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

export default PenitipForm; 