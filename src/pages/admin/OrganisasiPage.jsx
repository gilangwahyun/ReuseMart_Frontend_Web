import React, { useEffect, useState } from "react";
import { getOrganisasi, deleteOrganisasi, updateOrganisasi } from "../../api/OrganisasiApi"; // Pastikan fungsi ini ada
import { deleteUser  } from "../../api/UserApi";
import AdminOrganisasi from "../../components/AdminOrganisasi"; // Import the new form component

const OrganisasiPage = () => {
  const [organisasi, setOrganisasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null);

  useEffect(() => {
    const fetchOrganisasi = async () => {
      try {
        const data = await getOrganisasi();
        setOrganisasi(data);
      } catch (err) {
        setError(err.message || "Failed to fetch organisasi data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisasi();
  }, []);

  const handleDelete = async (id_organisasi, id_user) => {
    if (!id_organisasi || !id_user) {
      console.error("ID tidak valid:", id_organisasi, id_user);
      return;
    }
    console.log("Deleting user with ID:", id_user);
    if (window.confirm("Apakah Anda yakin ingin menghapus organisasi dan user ini?")) {
      try {
        await deleteOrganisasi(id_organisasi);
        await deleteUser (id_user);
        setOrganisasi((prev) => prev.filter((org) => org.id_organisasi !== id_organisasi));
      } catch (err) {
        console.error("Error saat menghapus:", err);
        setError(err.message || "Gagal menghapus organisasi atau user");
      }
    }
  };

  const handleEdit = (org) => {
    setCurrentOrg(org);
    setIsEditing(true);
  };

  const handleUpdate = async (updatedData) => {
    try {
      await updateOrganisasi(currentOrg.id_organisasi, updatedData);
      setOrganisasi((prev) =>
        prev.map((org) => (org.id_organisasi === currentOrg.id_organisasi ? { ...org, ...updatedData } : org))
      );
      setIsEditing(false);
      setCurrentOrg(null);
    } catch (err) {
      console.error("Error saat mengupdate:", err);
      setError(err.message || "Gagal mengupdate organisasi");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Manajemen Organisasi</h2>
      {loading && <p>Loading data...</p>}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && (
        <>
          {isEditing ? (
            <AdminOrganisasi currentOrg={currentOrg} onUpdate={handleUpdate} onCancel={() => setIsEditing(false)} />
          ) : (
            <>
              {organisasi.length === 0 ? (
                <p>Tidak ada data organisasi.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nama Organisasi</th>
                        <th scope="col">Alamat</th>
                        <th scope="col">Kontak</th>
                        <th scope="col">Deskripsi</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organisasi.map((org, index) => (
                        <tr key={org.id_organisasi || index}>
                          <th scope="row">{index + 1}</th>
                          <td>{org.nama_organisasi}</td>
                          <td>{org.alamat}</td>
                          <td>{org.no_telepon}</td>
                          <td>{org.deskripsi}</td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(org)}>Edit</button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(org.id_organisasi, org.id_user)}>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OrganisasiPage;