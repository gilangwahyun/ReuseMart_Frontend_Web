import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Register  } from "../api/AuthApi"; // Sesuaikan path sesuai kebutuhan
import { createOrganisasi } from "../api/OrganisasiApi"; // Sesuaikan path sesuai kebutuhan

const RegisterFormOrganisasi = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaOrganisasi: "",
    alamat: "",
    noTelepon: "",
    deskripsi: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Organisasi",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.namaOrganisasi.trim()) newErrors.namaOrganisasi = "Nama Organisasi wajib diisi.";
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat wajib diisi.";
    if (!formData.noTelepon.trim()) newErrors.noTelepon = "No Telepon wajib diisi.";
    if (!formData.deskripsi.trim()) newErrors.deskripsi = "Deskripsi wajib diisi.";
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
    if (!validate()) return;

    const userData = {
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      role: formData.role,
    };

    try {
      const userResponse = await Register(userData);
      const token = userResponse.token;
      const userId = userResponse.user.id_user;

      localStorage.setItem('bearerToken', token);

      const organisasiData = {
        id_user: userId,
        nama_organisasi: formData.namaOrganisasi,
        alamat: formData.alamat,
        no_telepon: formData.noTelepon,
        deskripsi: formData.deskripsi,
      };

      await createOrganisasi(organisasiData);

      setMessage("Registrasi berhasil");
      setFormData({
        namaOrganisasi: "",
        alamat: "",
        noTelepon: "",
        deskripsi: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Organisasi",
      });
      setErrors({});
      navigate('/');
    } catch (error) {
      console.error("Error during registration:", error.response?.data || error.message);
      setMessage("Registrasi gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4" style={{ width: '400px' }}>
        <h1 className="text-center text-primary p-1">Register Organisasi</h1>
        {message && <div className={`alert ${message.includes("berhasil") ? "alert-success" : "alert-danger"}`}>{message}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="namaOrganisasi" className="form-label">Nama Organisasi</label>
            <input
              type="text"
              name="namaOrganisasi"
              id="namaOrganisasi"
              value={formData.namaOrganisasi}
              onChange={handleChange}
              className={`form-control ${errors.namaOrganisasi ? "is-invalid" : ""}`}
              placeholder="PT Jaya"
            />
            {errors.namaOrganisasi && <div className="invalid-feedback">{errors.namaOrganisasi}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="alamat" className="form-label">Alamat</label>
            <input
              type="text"
              name="alamat"
              id="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className={`form-control ${errors.alamat ? "is-invalid" : ""}`}
              placeholder="Jl. Semangka"
            />
            {errors.alamat && <div className="invalid-feedback">{errors.alamat}</div>}
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
            />
            {errors.noTelepon && <div className="invalid-feedback">{errors.noTelepon}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="deskripsi" className="form-label">Deskripsi</label>
            <textarea
              name="deskripsi"
              id="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              className={`form-control ${errors.deskripsi ? "is-invalid" : ""}`}
              placeholder="Deskripsi organisasi"
              rows={3}
            />
            {errors.deskripsi && <div className="invalid-feedback">{errors.deskripsi}</div>}
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
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterFormOrganisasi;