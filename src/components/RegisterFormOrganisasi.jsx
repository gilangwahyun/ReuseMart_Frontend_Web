import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Register  } from "../api/AuthApi"; // Sesuaikan path sesuai kebutuhan
import { createOrganisasi } from "../api/OrganisasiApi"; // Sesuaikan path sesuai kebutuhan
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const userData = {
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      role: formData.role,
    };

    try {
      console.log("Mengirim data register organisasi:", userData);
      
      const userResponse = await Register(userData);
      console.log("Response register organisasi lengkap:", userResponse);
      
      // Memeriksa struktur response dari backend
      if (!userResponse) {
        throw new Error("Tidak ada response dari server");
      }
      
      // Berdasarkan UserController.php, response register seharusnya memiliki struktur:
      // { message: '...', user: {...} }
      
      // Simpan user ID dari response register
      const userId = userResponse.user?.id_user;
      
      if (!userId) {
        console.error("ID user tidak ditemukan dalam response:", userResponse);
        throw new Error("ID user tidak ditemukan dalam response");
      }

      console.log("Membuat data organisasi dengan user ID:", userId);

      const organisasiData = {
        id_user: userId,
        nama_organisasi: formData.namaOrganisasi,
        alamat: formData.alamat,
        no_telepon: formData.noTelepon,
        deskripsi: formData.deskripsi,
      };

      const organisasiResponse = await createOrganisasi(organisasiData);
      console.log("Response create organisasi:", organisasiResponse);

      toast.success("Registrasi berhasil! Silakan login dengan akun baru Anda.");
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
      
      setTimeout(() => {
        navigate('/LoginPage');
      }, 2000);
    } catch (error) {
      console.error("Error during registration:", error);
      
      // Tampilkan pesan error yang lebih spesifik
      let errorMessage = "Registrasi gagal. ";
      
      if (error.response) {
        // Error dari response API
        if (error.response.data && error.response.data.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage += error.response.data.error;
        } else if (error.response.status === 422) {
          errorMessage += "Data yang dimasukkan tidak valid. Periksa kembali form Anda.";
        } else if (error.response.status === 409) {
          errorMessage += "Email sudah terdaftar. Gunakan email lain.";
        } else if (error.response.status >= 500) {
          errorMessage += "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        }
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        errorMessage += "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message) {
        // Error lainnya
        errorMessage += error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg border-0 rounded-4 p-4">
      <h3 className="text-center mb-4 fw-bold text-success">Register Organisasi</h3>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-md-6">
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              {errors.deskripsi && <div className="invalid-feedback">{errors.deskripsi}</div>}
            </div>
          </div>
          
          <div className="col-md-6">
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

            <div className="mb-4">
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
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100 py-2 fw-bold mt-2"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      
      <div className="mt-3 text-center">
        <p className="mb-0">
          Sudah punya akun? <Link to="/LoginPage" className="text-success fw-medium">Login</Link>
        </p>
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default RegisterFormOrganisasi;