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
  const [modalVisible, setModalVisible] = useState(false);

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
        const pegawaiData = {
          id_user: editingPegawai.id_user,
          id_jabatan: formData.id_jabatan,
          nama_pegawai: formData.nama_pegawai,
          tanggal_lahir: formData.tanggal_lahir,
          no_telepon: formData.no_telepon,
          alamat: formData.alamat,
        };
        console.log("Data yang akan diupdate:", pegawaiData);
        await updatePegawai(editingPegawai.id_pegawai, pegawaiData);

        fetchPegawai();

        alert("Pegawai berhasil diperbarui!");
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
          alert("Pegawai berhasil dibuat!");
        } else {
          alert("Terjadi kesalahan saat membuat pegawai.");
        }
      }
      setModalVisible(false);
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat registrasi atau pembuatan pegawai.");
    }
  };

  const handleEdit = (pegawai) => {
    setEditingPegawai(pegawai);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePegawai(id);
      setSuccess("Pegawai berhasil dihapus.");
      fetchPegawai();
    } catch (err) {
      console.error("Gagal menghapus data pegawai:", err);
      setError("Gagal menghapus data pegawai.");
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <h3>Manajerial Pegawai</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Cari nama atau jabatan..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary mb-3"
          onClick={() => {
            setEditingPegawai(null);
            setModalVisible(true);
          }}
        >
          Tambah Pegawai
        </button>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <PegawaiTable
            data={pegawaiList}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Modal for PegawaiForm */}
        {modalVisible && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingPegawai ? "Edit Pegawai" : "Tambah Pegawai"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalVisible(false)}
                  />
                </div>
                <div className="modal-body">
                  <PegawaiForm
                    onSubmit={handleSubmit}
                    initialData={editingPegawai || {}}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PegawaiManagement;