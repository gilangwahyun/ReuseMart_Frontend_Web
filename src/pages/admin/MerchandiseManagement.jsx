import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
  getAllMerchandise,
  createMerchandise,
  updateMerchandise,
  deleteMerchandise,
} from "../../api/MerchandiseApi";

const initialForm = {
  nama_merchandise: "",
  jumlah_poin: "",
  stok: "",
};

const MerchandiseManagement = () => {
  const [merchandiseList, setMerchandiseList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMerchandise = async () => {
    setLoading(true);
    try {
      const res = await getAllMerchandise();
      setMerchandiseList(res.data || res);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data merchandise.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      fetchMerchandise();
      return;
    }
    const filtered = merchandiseList.filter((m) =>
      m.nama_merchandise.toLowerCase().includes(term.toLowerCase())
    );
    setMerchandiseList(filtered);
  };

  const handleShowForm = () => {
    setEditing(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      nama_merchandise: item.nama_merchandise,
      jumlah_poin: item.jumlah_poin,
      stok: item.stok,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus merchandise ini?")) return;
    setLoading(true);
    try {
      await deleteMerchandise(id);
      setSuccess("Berhasil menghapus merchandise.");
      fetchMerchandise();
    } catch {
      setError("Gagal menghapus merchandise.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateMerchandise(editing.id_merchandise, form);
        setSuccess("Berhasil update merchandise.");
      } else {
        await createMerchandise(form);
        setSuccess("Berhasil tambah merchandise.");
      }
      setShowForm(false);
      setForm(initialForm);
      fetchMerchandise();
    } catch {
      setError("Gagal menyimpan merchandise.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setEditing(null);
    setForm(initialForm);
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajerial Merchandise</h2>
            {!showForm && (
              <button className="btn btn-primary" onClick={handleShowForm}>
                + Tambah Merchandise
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!showForm && (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari merchandise..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-secondary w-100"
                      onClick={() => handleSearch("")}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Merchandise */}
          {!showForm && (
            <div className="card shadow-sm p-3">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                  <span className="ms-2">Memuat data...</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>No</th>
                        <th>Nama Merchandise</th>
                        <th>Jumlah Poin</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {merchandiseList.map((item, idx) => (
                        <tr key={item.id_merchandise}>
                          <td>{idx + 1}</td>
                          <td>{item.nama_merchandise}</td>
                          <td>{item.jumlah_poin}</td>
                          <td>{item.stok}</td>
                          <td>
                            <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(item)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id_merchandise)}>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Form Tambah/Edit Merchandise */}
          {showForm && (
            <>
              <div className="d-flex align-items-center mb-4">
                <button
                  type="button"
                  className="btn btn-outline-success me-3"
                  onClick={handleBack}
                >
                  ← Kembali
                </button>
                <h2 className="fw-bold mb-0">{editing ? "Edit Merchandise" : "Form Tambah Merchandise"}</h2>
              </div>
              <div className="card shadow-sm p-4 w-100">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nama Merchandise</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.nama_merchandise}
                        onChange={e => setForm(f => ({ ...f, nama_merchandise: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Jumlah Poin</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.jumlah_poin}
                        onChange={e => setForm(f => ({ ...f, jumlah_poin: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Stok</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.stok}
                        onChange={e => setForm(f => ({ ...f, stok: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-success px-4 py-2 fw-semibold" disabled={loading}>
                      {loading ? 'Menyimpan...' : (editing ? 'Update' : 'Simpan')}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchandiseManagement; 