import React, { useState, useEffect } from "react";

const OrganisasiForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
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
    setFormData({ nama: "", alamat: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <input
        className="form-control mb-2"
        name="nama"
        placeholder="Nama Organisasi"
        value={formData.nama}
        onChange={handleChange}
        required
      />
      <input
        className="form-control mb-2"
        name="alamat"
        placeholder="Alamat"
        value={formData.alamat}
        onChange={handleChange}
      />
      <button className="btn btn-primary w-100" type="submit">
        {initialData ? "Update" : "Tambah"} Organisasi
      </button>
    </form>
  );
};

export default OrganisasiForm;