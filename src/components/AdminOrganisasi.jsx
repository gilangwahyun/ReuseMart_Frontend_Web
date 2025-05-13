import React, { useState, useEffect } from "react";

const AdminOrganisasi = ({ currentOrg, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    nama_organisasi: '',
    alamat: '',
    no_telepon: '',
    deskripsi: '',
  });

  useEffect(() => {
    if (currentOrg) {
      setFormData({
        nama_organisasi: currentOrg.nama_organisasi,
        alamat: currentOrg.alamat,
        no_telepon: currentOrg.no_telepon,
        deskripsi: currentOrg.deskripsi,
      });
    }
  }, [currentOrg]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleUpdate}>
      <h3>Edit Organisasi</h3>
      <div className="mb-3">
        <label className="form-label">Nama Organisasi</label>
        <input
          type="text"
          className="form-control"
          name="nama_organisasi"
          value={formData.nama_organisasi}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Alamat</label>
        <input
          type="text"
          className="form-control"
          name="alamat"
          value={formData.alamat}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Kontak</label>
        <input
          type="text"
          className="form-control"
          name="no_telepon"
          value={formData.no_telepon}
          onChange={handleFormChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Deskripsi</label>
        <textarea
          className="form-control"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleFormChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Update</button>
      <button type="button" className="btn btn-secondary ms-2" onClick={onCancel}>Batal</button>
    </form>
  );
};

export default AdminOrganisasi;