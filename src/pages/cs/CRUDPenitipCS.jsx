import React, { useEffect, useState } from "react";
import CSSidebar from "../../components/CSSidebar";
import PenitipForm from "../../components/CSComponents/PenitipForm";
import PenitipTable from "../../components/CSComponents/PenitipTable";
import { 
  getAllPenitip, 
  getPenitipById, 
  updatePenitip, 
  deletePenitip, 
  searchPenitipByName,
  createPenitip 
} from "../../api/PenitipApi";
import { Register } from "../../api/AuthApi";

const CRUDPenitipCS = () => {
  const [penitipList, setPenitipList] = useState([]);
  const [editingPenitip, setEditingPenitip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchPenitip = async () => {
    setLoading(true);
    try {
      const data = await getAllPenitip();
      setPenitipList(data);
      setError(null);
      setSuccess(null);
    } catch (err) {
      console.error("Gagal memuat data penitip:", err);
      setError("Gagal memuat data penitip.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      fetchPenitip();
      return;
    }

    setLoading(true);
    try {
      const results = await searchPenitipByName(term);
      setPenitipList(results);
      setError(null);
    } catch (err) {
      console.error("Gagal mencari data penitip:", err);
      setError("Gagal mencari data penitip.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenitip();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingPenitip) {
        if (!window.confirm("Apakah Anda yakin ingin mengupdate data penitip ini?")) return;
        
        console.log('Editing penitip with ID:', editingPenitip.id_penitip);
        console.log('Original penitip data:', editingPenitip);
        
        // Log FormData contents for debugging
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + (pair[0] === 'foto_ktp' ? 'File Object' : pair[1]));
        }
        
        setLoading(true);
        // Update existing penitip (formData sudah berisi id_user)
        try {
          const response = await updatePenitip(editingPenitip.id_penitip, formData);
          console.log('Update response:', response);
          await fetchPenitip();
          setSuccess("Penitip berhasil diupdate.");
        } catch (updateError) {
          console.error('Update error:', updateError);
          setError("Terjadi kesalahan saat update: " + (updateError.response?.data?.message || updateError.message));
        }
      } else {
        // Create new penitip - sama seperti pola di PegawaiManagement
        setLoading(true);
        // First, register the user
        const registerData = {
          email: formData.get('email'),
          password: formData.get('password'),
          role: 'Penitip',
        };
        
        const registerResponse = await Register(registerData);
        
        if (registerResponse.user && registerResponse.user.id_user) {
          // Then create the penitip profile - tambahkan id_user ke FormData
          formData.append('id_user', registerResponse.user.id_user);
          
          await createPenitip(formData);
          fetchPenitip();
          setSuccess("Penitip berhasil dibuat!");
        } else {
          setError("Terjadi kesalahan saat membuat penitip.");
        }
      }
      
      setShowForm(false);
      setEditingPenitip(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (penitip) => {
    try {
      const detailData = await getPenitipById(penitip.id_penitip);
      setEditingPenitip(detailData);
      setShowForm(true);
    } catch (err) {
      console.error("Error fetching penitip detail:", err);
      setError("Gagal memuat detail penitip.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus penitip ini? Akun pengguna yang terkait juga akan dihapus secara permanen.")) return;
    setLoading(true);
    try {
      await deletePenitip(id);
      setSuccess("Penitip dan akun pengguna terkait berhasil dihapus.");
      fetchPenitip();
    } catch (err) {
      console.error("Gagal menghapus data penitip:", err);
      setError("Gagal menghapus data penitip: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleShowForm = () => {
    setEditingPenitip(null);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingPenitip(null);
  };

  return (
    <div className="d-flex">
      <CSSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajemen Penitip</h2>
            {!showForm && (
              <button className="btn btn-success" onClick={handleShowForm}>
                + Tambah Penitip
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
                      placeholder="Cari nama penitip..."
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

          {/* Tabel Penitip */}
          {!showForm && (
            <div className="card shadow-sm p-3">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-success" role="status" aria-hidden="true"></div>
                  <span className="ms-2">Memuat data...</span>
                </div>
              ) : (
                <PenitipTable
                  data={penitipList}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}

          {/* Form Tambah/Edit Penitip */}
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
                <h2 className="fw-bold mb-0">{editingPenitip ? "Edit Penitip" : "Form Tambah Penitip"}</h2>
              </div>
              <div className="card shadow-sm p-4 w-100">
                <PenitipForm
                  onSubmit={handleSubmit}
                  onClose={handleBack}
                  initialData={editingPenitip || {}}
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

export default CRUDPenitipCS;
 