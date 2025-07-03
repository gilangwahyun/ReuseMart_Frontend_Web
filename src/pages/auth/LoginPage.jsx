import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Login } from '../../api/AuthApi';
import { getJabatanByUser } from '../../api/PegawaiApi';
import 'react-toastify/dist/ReactToastify.css'; // penting!

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Beberapa opsi background yang bisa dipilih - silakan uncomment yang disukai
  const backgroundStyles = {
    // Opsi 1: Gradient yang lebih halus dengan lebih banyak titik transisi
    option1: {
      background: 'linear-gradient(to bottom, #f8f9fa 0%, rgba(200, 230, 201, 0.5) 30%, rgba(129, 199, 132, 0.6) 60%, rgba(76, 175, 80, 0.8) 100%)'
    },
    
    // Opsi 2: Warna solid dengan pattern subtle
    option2: {
      backgroundColor: '#f8f9fa',
      backgroundImage: 'radial-gradient(#4CAF50 0.5px, transparent 0.5px), radial-gradient(#4CAF50 0.5px, #f8f9fa 0.5px)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      backgroundAttachment: 'fixed'
    },
    
    // Opsi 3: Gradient radial yang lebih lembut
    option3: {
      background: 'radial-gradient(circle at center, #ffffff 0%, #e8f5e9 40%, #c8e6c9 70%, #a5d6a7 100%)'
    },
    
    // Opsi 4: Background putih dengan border hijau
    option4: {
      backgroundColor: '#ffffff',
      borderTop: '8px solid #4CAF50',
      boxShadow: 'inset 0 8px 12px -8px rgba(76, 175, 80, 0.3)'
    }
  };
  
  // Pilih opsi background yang diinginkan - ganti angka untuk opsi yang berbeda (1-4)
  const selectedBackground = backgroundStyles.option2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Login({ email, password });

      if (response && response.token) {
        toast.success(response.message || 'Login berhasil!');

        setTimeout(async () => {
          const user = JSON.parse(localStorage.getItem('user'));
          console.log("Login successful - User data:", user);

          if (user.role === 'Pegawai') {
            const jabatanResponse = await getJabatanByUser(user.id_user);
            const id_jabatan = parseInt(jabatanResponse.data.id_jabatan, 10);
            console.log(jabatanResponse);

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
              default:
                navigate('/dashboard-pegawai');
            }
          } else {
            // Normalize role to lowercase for consistent comparison
            const normalizedRole = user.role.toLowerCase();
            console.log("Normalized role:", normalizedRole);
            
            // Store normalized role
            user.normalizedRole = normalizedRole;
            localStorage.setItem('user', JSON.stringify(user));
            
            switch (normalizedRole) {
              case 'pembeli':
                console.log("Redirecting as Pembeli - ID User:", user.id_user);
                navigate('/');
                break;
              case 'penitip':
                console.log("Redirecting as Penitip - ID User:", user.id_user);
                navigate(`/DashboardProfilPenitip/${user.id_user}`);
                break;
              case 'organisasi':
                console.log("Redirecting as Organisasi - ID User:", user.id_user);
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
    <div 
      className="login-container vh-100 d-flex flex-column justify-content-center align-items-center position-relative" 
      style={{
        ...selectedBackground,
        minHeight: '100vh'
      }}
    >
      {/* Tombol Kembali */}
      <div className="position-absolute top-0 start-0 m-3">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-success rounded-circle shadow-sm"
          style={{ width: '40px', height: '40px' }}
        >
          <FaArrowLeft />
        </button>
      </div>
      
      <div className="text-center mb-5" style={{ marginTop: '-60px' }}>
        <img 
          src="/assets/logoReuseMart.png" 
          alt="ReuseMart Logo" 
          className="img-fluid" 
          style={{ 
            maxHeight: '150px', 
            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' 
          }}
        />
      </div>
      
      <div className="login-card-container" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card shadow-lg border-0 rounded-4 p-4">
          <h3 className="text-center mb-4 fw-bold text-success">Login</h3>

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
              className="btn btn-success w-100 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
            
            <div className="mt-3 text-center">
              <p className="mb-0">
                Belum punya akun? <Link to="/RegisterPembeli" className="text-success fw-medium">Daftar sekarang</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
