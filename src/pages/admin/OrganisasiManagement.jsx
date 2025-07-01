import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import OrganisasiForm from "../../components/AdminComponents/OrganisasiForm";
import OrganisasiTable from "../../components/AdminComponents/OrganisasiTable";
import { getOrganisasi, updateOrganisasi, deleteOrganisasi } from "../../api/OrganisasiApi";
import { toast } from "react-toastify";

const OrganisasiManagement = () => {
  const [organisasi, setOrganisasi] = useState([]);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrganisasi = async () => {
    try {
      setLoading(true);
      const data = await getOrganisasi();
      setOrganisasi(data);
    } catch (error) {
      toast.error("Gagal memuat data organisasi");
      console.error("Error fetching organisasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisasi();
  }, []);

  // Function to safely get ID from object
  const getOrganisasiId = (org) => {
    if (!org) return null;
    
    if (org.id_organisasi) return org.id_organisasi;
    if (org.id) return org.id;
    
    return null;
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Get current user ID for submissions
      let userId;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
        }
      } catch (e) {
        console.error("Error getting user ID:", e);
      }
      
      // Add user_id if available
      const dataToSubmit = userId 
        ? { ...formData, user_id: userId }
        : formData;
      
      // Get organization ID
      const organisasiId = getOrganisasiId(editData);
      
      if (!organisasiId) {
        toast.error("ID organisasi tidak ditemukan, tidak dapat melakukan update");
        setLoading(false);
        return;
      }
      
      // Update existing organisasi
      await updateOrganisasi(organisasiId, dataToSubmit);
      toast.success("Organisasi berhasil diperbarui");
      
      setEditData(null);
      fetchOrganisasi();
    } catch (error) {
      if (error.response) {
        // Show more specific error message if available
        const errorMessage = error.response.data?.message || "Gagal memperbarui organisasi";
        toast.error(errorMessage);
      } else {
        toast.error("Gagal memperbarui organisasi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org) => {
    setEditData(org);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus organisasi ini?")) {
      try {
        setLoading(true);
        await deleteOrganisasi(id);
        toast.success("Organisasi berhasil dihapus");
        fetchOrganisasi();
      } catch (error) {
        toast.error("Gagal menghapus organisasi");
        console.error("Error deleting organisasi:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <h3>Manajerial Organisasi</h3>
        <p>Halaman untuk Read, Update, dan Delete data Organisasi.</p>
        
        <div className="row">
          {editData && (
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header">
                  Edit Organisasi
                </div>
                <div className="card-body">
                  <OrganisasiForm 
                    onSubmit={handleSubmit} 
                    initialData={editData} 
                  />
                  <button 
                    className="btn btn-secondary w-100 mt-2"
                    onClick={() => setEditData(null)}
                  >
                    Batal Edit
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className={editData ? "col-md-8" : "col-md-12"}>
            <div className="card">
              <div className="card-header">
                Daftar Organisasi
              </div>
              <div className="card-body">
                {loading ? (
                  <p>Memuat data...</p>
                ) : organisasi.length === 0 ? (
                  <p className="text-center">Tidak ada data organisasi</p>
                ) : (
                  <OrganisasiTable 
                    data={organisasi} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisasiManagement;