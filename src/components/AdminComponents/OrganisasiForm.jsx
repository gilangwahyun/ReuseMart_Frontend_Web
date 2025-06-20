import React, { useState, useEffect } from "react";

const OrganisasiForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    no_telepon: "",
    deskripsi: ""
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nama: "", alamat: "", no_telepon: "", deskripsi: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="mb-3">
        <label htmlFor="nama" className="form-label">Nama Organisasi</label>
        <input
          id="nama"
          className="form-control"
          name="nama"
          placeholder="Nama Organisasi"
          value={formData.nama}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="alamat" className="form-label">Alamat</label>
        <textarea
          id="alamat"
          className="form-control"
          name="alamat"
          placeholder="Alamat"
          value={formData.alamat}
          onChange={handleChange}
          required
          rows="3"
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="no_telepon" className="form-label">Nomor Telepon</label>
        <input
          id="no_telepon"
          className="form-control"
          name="no_telepon"
          placeholder="Nomor Telepon"
          value={formData.no_telepon}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="deskripsi" className="form-label">Deskripsi</label>
        <textarea
          id="deskripsi"
          className="form-control"
          name="deskripsi"
          placeholder="Deskripsi Organisasi"
          value={formData.deskripsi}
          onChange={handleChange}
          required
          rows="4"
        />
      </div>

      <button className="btn btn-primary w-100" type="submit">
        {initialData ? "Update" : "Tambah"} Organisasi
      </button>
    </form>
  );
};

export default OrganisasiForm;