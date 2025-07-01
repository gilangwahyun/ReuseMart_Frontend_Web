import React, { useState, useEffect } from "react";

const OrganisasiForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    nama_organisasi: "",
    alamat: "",
    no_telepon: "",
    deskripsi: ""
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        nama_organisasi: initialData.nama_organisasi || "",
        alamat: initialData.alamat || "",
        no_telepon: initialData.no_telepon || "",
        deskripsi: initialData.deskripsi || ""
      };
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = initialData?.id 
      ? { ...formData, id: initialData.id }
      : initialData?.id_organisasi
        ? { ...formData, id_organisasi: initialData.id_organisasi }
        : formData;
    
    onSubmit(dataToSubmit);
    
    if (!initialData) {
      setFormData({ 
        nama_organisasi: "", 
        alamat: "", 
        no_telepon: "", 
        deskripsi: "" 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="mb-3">
        <label htmlFor="nama" className="form-label">Nama Organisasi</label>
        <input
          id="nama_organisasi"
          className="form-control"
          name="nama_organisasi"
          placeholder="Nama Organisasi"
          value={formData.nama_organisasi}
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