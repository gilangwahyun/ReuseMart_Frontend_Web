import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import useAxios from '../../api/LoginPageApi';
import '../../styles/LoginPageStyle.css';
import { getJabatanByUser } from '../../api/PegawaiApi';
import { getPegawaiByUserId } from '../../api/PegawaiApi';
import { getJabatanByPegawai } from '../../api/JabatanApi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await useAxios.post('/login', {
        email,
        password
      });

      const { access_token, token_type, data } = response.data;
      
      // Simpan token dengan format yang benar
      localStorage.setItem('token', `${token_type} ${access_token}`);
      
      // Simpan data user
      localStorage.setItem('user', JSON.stringify(data));
      
      // Tambahkan log user
      console.log('User yang login:', data);
      
      setMessage(response.data.message || 'Login berhasil!');

      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'Pegawai') {
        getJabatanByUser(user.id_user)
          .then(res => {
            const { id_jabatan } = res.data;
            switch (id_jabatan) {
              case 1:
                navigate('/DashboardOwner');
                break;
              case 2:
                navigate('/DashboardAdmin');
                break;
              case 3:
                navigate('/DashboardPegawaiGudang');
                break;
              case 4:
                navigate('/CRUDPenitip');
                break;
              case 5:
                navigate('/DashboardHunter');
                break;
              case 6:
                navigate('/DashboardKurir');
                break;
              default:
                navigate('/dashboard-pegawai');
            }
          })
          .catch(() => {
            setMessage('Gagal mengambil data jabatan pegawai');
          });
      } else {
        // Redirect berdasarkan role pengguna
        switch (data.role) {
          case 'Pembeli':
            navigate('/DashboardProfilPembeli');
            break;
          case 'Penitip':
            navigate('/DashboardPenitip');
            break;
          case 'Organisasi':
            navigate('/DashboardOrganisasi');
            break;
          case 'Pegawai':
            navigate('/DashboardPegawai');
            break;
          default:
            navigate('/');
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setMessage(error.response.data.message || 'Login gagal');
      } else if (error.request) {
        setMessage('Tidak dapat terhubung ke server');
      } else {
        setMessage('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ position: 'relative' }}>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login ReuseMart</h2>
        {message && (
          <div className={`message ${message.includes('gagal') || message.includes('kesalahan') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Masukkan email Anda"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Masukkan password Anda"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
