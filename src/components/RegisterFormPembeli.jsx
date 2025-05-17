import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import { Register  } from "../api/AuthApi"; // Sesuaikan path sesuai kebutuhan
import { createPembeli } from "../api/PembeliApi"; // Sesuaikan path sesuai kebutuhan

const RegisterFormPembeli = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaPembeli: "",
    noTelepon: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Pembeli",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.namaPembeli.trim()) newErrors.namaPembeli = "Nama wajib diisi.";
    if (!formData.noTelepon.trim()) newErrors.noTelepon = "No Telepon wajib diisi.";
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi.";
    if (!formData.password) newErrors.password = "Password wajib diisi.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Password dan konfirmasi tidak cocok.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;
    setLoading(true);

    try {
      // Daftarkan pengguna terlebih dahulu
      const userResponse = await Register ({
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
      });

      const token = userResponse.token;
      const userId = userResponse.user.id_user; // Ambil id_user
      localStorage.setItem('bearerToken', token);

      // Buat pembeli tanpa mengirim id_pembeli
      await createPembeli({
        id_user: userId,
        nama_pembeli: formData.namaPembeli,
        jumlah_poin: 0, // Atur jumlah_poin default
        no_hp_default: formData.noTelepon,
      });

      setMessage("Registrasi berhasil");
      setFormData({
        namaPembeli: "",
        noTelepon: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Pembeli",
      });
      setErrors({});
      navigate('/');
    } catch (error) {
      console.error("Error during registration:", error.response?.data || error.message);
      setMessage("Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4" style={{ width: '400px' }}>
        <h1 className="text-center text-primary p-1">Register Pembeli</h1>
        {message && <div className={`alert ${message.includes("berhasil") ? "alert-success" : "alert-danger"}`}>{message}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="namaPembeli" className="form-label">Nama</label>
            <input
              type="text"
              name="namaPembeli"
              id="namaPembeli"
              value={formData.namaPembeli}
              onChange={handleChange}
              className={`form-control ${errors.namaPembeli ? "is-invalid" : ""}`}
              placeholder="Ali Putra"
              disabled={loading}
            />
            {errors.namaPembeli && <div className="invalid-feedback">{ errors.namaPembeli}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="noTelepon" className="form-label">No Telepon</label>
            <input
              type="text"
              name="noTelepon"
              id="noTelepon"
              value={formData.noTelepon}
              onChange={handleChange}
              className={`form-control ${errors.noTelepon ? "is-invalid" : ""}`}
              placeholder="081234567891"
              disabled={loading}
            />
            {errors.noTelepon && <div className="invalid-feedback">{errors.noTelepon}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="email@example.com"
              disabled={loading}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="********"
              disabled={loading}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="********"
              disabled={loading}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Register"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>
            Ingin daftar sebagai organisasi?{" "}
            <Link to="/RegisterOrganisasi" className="text-primary">
              Klik di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormPembeli;