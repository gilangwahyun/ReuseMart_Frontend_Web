import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import OrganisasiForm from "../../components/AdminComponents/OrganisasiForm";
import OrganisasiTable from "../../components/AdminComponents/OrganisasiTable";
import { getOrganisasi, createOrganisasi, updateOrganisasi, deleteOrganisasi } from "../../api/OrganisasiApi";
import { toast } from "react-toastify";

const OrganisasiManagement = () => {
  const [organisasi, setOrganisasi] = useState([]);
  const [editingOrganisasi, setEditingOrganisasi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrganisasi();
  }, []);

  const fetchOrganisasi = async () => {
    setIsLoading(true);
    try {
      const data = await getOrganisasi();
      setOrganisasi(data);
    } catch (error) {
      console.error("Error fetching organisasi:", error);
      toast.error("Gagal memuat data organisasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (editingOrganisasi) {
        // Update existing organisasi
        const updatedData = {
          nama_organisasi: formData.nama,
          alamat: formData.alamat,
          no_telepon: formData.no_telepon || "",
          deskripsi: formData.deskripsi || ""
        };
        await updateOrganisasi(editingOrganisasi.id_organisasi, updatedData);
        toast.success("Organisasi berhasil diperbarui");
        setEditingOrganisasi(null);
      } else {
        // Create new organisasi
        const newData = {
          id_user: 1, // This should be dynamically set in a real app
          nama_organisasi: formData.nama,
          alamat: formData.alamat,
          no_telepon: formData.no_telepon || "",
          deskripsi: formData.deskripsi || ""
        };
        await createOrganisasi(newData);
        toast.success("Organisasi berhasil ditambahkan");
      }
      fetchOrganisasi();
    } catch (error) {
      console.error("Error saving organisasi:", error);
      toast.error(editingOrganisasi ? "Gagal memperbarui organisasi" : "Gagal menambahkan organisasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (org) => {
    setEditingOrganisasi({
      id_organisasi: org.id,
      nama: org.nama,
      alamat: org.alamat,
      no_telepon: org.no_telepon,
      deskripsi: org.deskripsi
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus organisasi ini?")) {
      setIsLoading(true);
      try {
        await deleteOrganisasi(id);
        toast.success("Organisasi berhasil dihapus");
        fetchOrganisasi();
      } catch (error) {
        console.error("Error deleting organisasi:", error);
        toast.error("Gagal menghapus organisasi");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setEditingOrganisasi(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter organisasi based on search term
  const filteredOrganisasi = organisasi.filter(org => 
    org.nama_organisasi && org.nama_organisasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="p-4 w-100">
        <h3>Manajerial Organisasi</h3>
        <p>Halaman untuk Create, Read, Update, dan Delete data Organisasi.</p>
        
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                {editingOrganisasi ? "Edit Organisasi" : "Tambah Organisasi Baru"}
              </div>
              <div className="card-body">
                <OrganisasiForm 
                  onSubmit={handleSubmit} 
                  initialData={editingOrganisasi} 
                />
                {editingOrganisasi && (
                  <button 
                    className="btn btn-secondary w-100 mt-2" 
                    onClick={handleCancel}
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                Daftar Organisasi
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari nama organisasi..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredOrganisasi.length > 0 ? (
                  <OrganisasiTable 
                    data={filteredOrganisasi} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                ) : (
                  <p className="text-center">
                    {searchTerm 
                      ? "Tidak ada organisasi yang sesuai dengan pencarian" 
                      : "Tidak ada data organisasi"}
                  </p>
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