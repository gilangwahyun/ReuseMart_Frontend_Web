import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import PegawaiForm from "../../components/AdminComponents/PegawaiForm";
import PegawaiTable from "../../components/AdminComponents/PegawaiTable";
import { getAllPegawai, createPegawai, updatePegawai, deletePegawai, searchPegawaiByNamaOrJabatan } from "../../api/PegawaiApi";
import { Register } from "../../api/AuthApi";

const PegawaiManagement = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [editingPegawai, setEditingPegawai] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchPegawai = async () => {
    setLoading(true);
    try {
      const response = await getAllPegawai();
      setPegawaiList(response.data);
      setError(null);
      setSuccess(null);
    } catch (err) {
      console.error("Gagal memuat data pegawai:", err);
      setError("Gagal memuat data pegawai.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      fetchPegawai();
      return;
    }

    setLoading(true);
    try {
      const response = await searchPegawaiByNamaOrJabatan(term);
      setPegawaiList(response.data);
      setError(null);
      setSuccess(null);
    } catch (err) {
      console.error("Gagal mencari data pegawai:", err);
      setError("Gagal mencari data pegawai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingPegawai) {
        if (!window.confirm("Apakah Anda yakin ingin mengupdate data pegawai ini?")) return;
        const pegawaiData = {
          id_user: editingPegawai.id_user,
          id_jabatan: formData.id_jabatan,
          nama_pegawai: formData.nama_pegawai,
          tanggal_lahir: formData.tanggal_lahir,
          no_telepon: formData.no_telepon,
          alamat: formData.alamat,
        };
        await updatePegawai(editingPegawai.id_pegawai, pegawaiData);
        fetchPegawai();
        setSuccess("Pegawai berhasil diupdate.");
      } else {
        const registerResponse = await Register({
          email: formData.email,
          password: formData.password,
          role: 'Pegawai',
        });
        if (registerResponse.user && registerResponse.user.id_user) {
          const pegawaiData = {
            id_user: registerResponse.user.id_user,
            id_jabatan: formData.id_jabatan,
            nama_pegawai: formData.nama_pegawai,
            tanggal_lahir: formData.tanggal_lahir,
            no_telepon: formData.no_telepon,
            alamat: formData.alamat,
          };
          await createPegawai(pegawaiData);
          fetchPegawai();
          setSuccess("Pegawai berhasil dibuat!");
        } else {
          setError("Terjadi kesalahan saat membuat pegawai.");
        }
      }
      setShowForm(false);
      setEditingPegawai(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan saat registrasi atau pembuatan pegawai.");
    }
  };

  const handleEdit = (pegawai) => {
    setEditingPegawai(pegawai);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) return;
    try {
      await deletePegawai(id);
      setSuccess("Pegawai berhasil dihapus.");
      fetchPegawai();
    } catch (err) {
      console.error("Gagal menghapus data pegawai:", err);
      setError("Gagal menghapus data pegawai.");
    }
  };

  const handleShowForm = () => {
    setEditingPegawai(null);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingPegawai(null);
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajemen Pegawai</h2>
            {!showForm && (
              <button className="btn btn-primary" onClick={handleShowForm}>
                + Tambah Pegawai
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
                      placeholder="Cari nama atau jabatan..."
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

          {/* Tabel Pegawai */}
          {!showForm && (
            <div className="card shadow-sm p-3">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                  <span className="ms-2">Memuat data...</span>
                </div>
              ) : (
                <PegawaiTable
                  data={pegawaiList}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}

          {/* Form Tambah/Edit Pegawai */}
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
                <h2 className="fw-bold mb-0">{editingPegawai ? "Edit Pegawai" : "Form Tambah Pegawai"}</h2>
              </div>
              <div className="card shadow-sm p-4 w-100">
                <PegawaiForm
                  onSubmit={handleSubmit}
                  onClose={handleBack}
                  initialData={editingPegawai || {}}
                  loading={loading}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PegawaiManagement;