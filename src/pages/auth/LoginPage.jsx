import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/userApi'; // gunakan fungsi loginUser

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
      const result = await loginUser(email, password);

      const { token, data, message: successMessage } = result;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));

      console.log('User logged in:', data);

      setMessage(successMessage || 'Login berhasil!');
      navigate('/');

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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login ReuseMart</h2>
        {message && (
          <div className={`message ${message.toLowerCase().includes('gagal') || message.toLowerCase().includes('kesalahan') ? 'error' : 'success'}`}>
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