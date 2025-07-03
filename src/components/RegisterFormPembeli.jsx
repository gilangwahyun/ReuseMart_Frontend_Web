import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import { Register  } from "../api/AuthApi"; // Sesuaikan path sesuai kebutuhan
import { createPembeli } from "../api/PembeliApi"; // Sesuaikan path sesuai kebutuhan
import { createKeranjang, getKeranjangByPembeli } from "../api/KeranjangApi"; // Sesuaikan path sesuai kebutuhan
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    if (!validate()) return;
    setLoading(true);

    try {
      console.log("Mengirim data register:", {
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
      });
      
      // Daftarkan pengguna terlebih dahulu
      const userResponse = await Register({
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
      });
      
      console.log("Response register lengkap:", userResponse);

      // Memeriksa struktur response dari backend
      if (!userResponse) {
        throw new Error("Tidak ada response dari server");
      }
      
      // Berdasarkan UserController.php, response register seharusnya memiliki struktur:
      // { message: '...', user: {...} }
      // dan tidak memiliki token, karena token hanya diberikan saat login
      
      // Simpan user ID dari response register
      const userId = userResponse.user?.id_user;
      
      if (!userId) {
        console.error("ID user tidak ditemukan dalam response:", userResponse);
        throw new Error("ID user tidak ditemukan dalam response");
      }
      
      console.log("Membuat data pembeli dengan user ID:", userId);
      
      // Buat pembeli tanpa mengirim id_pembeli
      const pembeliResponse = await createPembeli({
        id_user: userId,
        nama_pembeli: formData.namaPembeli,
        jumlah_poin: 0, // Atur jumlah_poin default
        no_hp_default: formData.noTelepon,
      });

      console.log("Response create pembeli:", pembeliResponse);

      const idPembeli = pembeliResponse?.data?.id_pembeli || pembeliResponse?.id_pembeli || pembeliResponse?.pembeli?.id_pembeli;
      
      if (!idPembeli) {
        console.error("ID Pembeli tidak ditemukan dalam response:", pembeliResponse);
        throw new Error("Gagal mendapatkan ID pembeli");
      }
      
      console.log("Membuat keranjang untuk pembeli ID:", idPembeli);
      
      const keranjangResponse = await createKeranjang({
        id_pembeli: idPembeli
      });

      console.log("Response create keranjang:", keranjangResponse);

      toast.success("Registrasi berhasil! Silakan login dengan akun baru Anda.");
      setFormData({
        namaPembeli: "",
        noTelepon: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Pembeli",
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
      <h3 className="text-center mb-4 fw-bold text-success">Register Pembeli</h3>
      
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

        <button
          type="submit"
          className="btn btn-success w-100 py-2 fw-bold"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      
      <div className="mt-3 text-center">
        <p className="mb-0">
          Ingin Register Sebagai Organisasi?{" "}
          <Link to="/RegisterOrganisasi" className="text-success fw-medium">
            Register di sini
          </Link>
        </p>
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default RegisterFormPembeli;