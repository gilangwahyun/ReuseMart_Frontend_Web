import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Login } from '../../api/AuthApi';
import { getJabatanByUser } from '../../api/PegawaiApi';
import 'react-toastify/dist/ReactToastify.css'; // penting!

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Login({ email, password });

      if (response && response.token) {
        toast.success(response.message || 'Login berhasil!');

        setTimeout(async () => {
          const user = JSON.parse(localStorage.getItem('user'));

          if (user.role === 'Pegawai') {
            const jabatanResponse = await getJabatanByUser(user.id_user);
            const { id_jabatan } = jabatanResponse.data;

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
                navigate('/DashboardCS');
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
          } else {
            switch (user.role) {
              case 'Pembeli':
                console.log("ID User:", user.id_user);
                navigate('/');
                break;
              case 'Penitip':
                console.log("ID User:", user.id_user);
                navigate('/DashboardPenitip');
                break;
              case 'Organisasi':
                console.log("ID User:", user.id_user);
                navigate('/DashboardOrganisasi');
                break;
              default:
                navigate('/');
            }
          }
        }, 2000);
      } else {
        toast.error('Login gagal, token tidak ditemukan.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-6">
        <div className="card shadow-lg border-0 rounded-4 p-4">
          <h3 className="text-center mb-4">Login ReuseMart</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Masukkan email Anda"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Masukkan password Anda"
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
