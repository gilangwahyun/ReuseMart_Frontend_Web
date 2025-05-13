import { useState } from "react";

export default function RegisterFormPenitip({ onSubmit, loading }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "penitip", // bisa hidden, atau select jika multi-role
    nama_penitip: "",
    nik: "",
    nomor_ktp: "",
    no_telepon: "",
    alamat: "",
    saldo: "",
    jumlah_poin: "",
  });
  const [fotoKtp, setFotoKtp] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFotoKtp(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (fotoKtp) {
      formData.append('foto_ktp', fotoKtp);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </label>
      {/* Role bisa hidden jika hanya penitip */}
      <input type="hidden" name="role" value="penitip" />
      <label>
        Nama Penitip:
        <input
          type="text"
          name="nama_penitip"
          value={form.nama_penitip}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        NIK:
        <input
          type="text"
          name="nik"
          value={form.nik}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Nomor KTP:
        <input
          type="text"
          name="nomor_ktp"
          value={form.nomor_ktp}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        No Telepon:
        <input
          type="text"
          name="no_telepon"
          value={form.no_telepon}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Foto KTP:
        <input
          type="file"
          name="foto_ktp"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
      </label>
      <label>
        Alamat:
        <input
          type="text"
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Saldo:
        <input
          type="number"
          name="saldo"
          value={form.saldo}
          onChange={handleChange}
        />
      </label>
      <label>
        Jumlah Poin:
        <input
          type="number"
          name="jumlah_poin"
          value={form.jumlah_poin}
          onChange={handleChange}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Mendaftar..." : "Daftar Penitip"}
      </button>
    </form>
  );
}
