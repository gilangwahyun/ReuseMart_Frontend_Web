import React, { useState } from 'react';
import axios from 'axios';

const RegisterPenitip = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Penitip',
    nama_penitip: '',
    nik: '',
    nomor_ktp: '',
    no_telepon: '',
    alamat: '',
    saldo: '',
    jumlah_poin: '',
    foto_ktp: null,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'foto_ktp') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      const res = await axios.post('/api/register-penitip', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Registrasi berhasil!');
      console.log(res.data);
    } catch (err) {
      setMessage('Registrasi gagal!');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="nama_penitip" placeholder="Nama Penitip" onChange={handleChange} required />
      <input type="text" name="nik" placeholder="NIK" onChange={handleChange} required />
      <input type="text" name="nomor_ktp" placeholder="Nomor KTP" onChange={handleChange} required />
      <input type="text" name="no_telepon" placeholder="No Telepon" onChange={handleChange} required />
      <textarea name="alamat" placeholder="Alamat" onChange={handleChange} required />
      <input type="number" name="saldo" placeholder="Saldo" onChange={handleChange} />
      <input type="number" name="jumlah_poin" placeholder="Jumlah Poin" onChange={handleChange} />
      <input type="file" name="foto_ktp" accept="image/*" onChange={handleChange} required />
      <button type="submit">Register</button>
      <p>{message}</p>
    </form>
  );
};

export default RegisterPenitip;