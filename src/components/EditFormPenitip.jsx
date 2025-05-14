import { useState } from "react";

export default function EditFormPenitip({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
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
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
