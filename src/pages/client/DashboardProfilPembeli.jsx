import React, { useEffect, useState } from 'react';
import {
  FaSignOutAlt
} from "react-icons/fa";
import { useParams, useNavigate } from 'react-router-dom';
import { getPembeliByUserId } from '../../api/PembeliApi';
import { Logout } from '../../api/AuthApi';
import { createAlamat, updateAlamat, getAlamatByPembeliId, deleteAlamat } from '../../api/AlamatApi';
import PembeliCard from '../../components/PembeliCard';
import AlamatForm from '../../components/AlamatForm';

const DashboardProfilePembeli = () => {
  const { id } = useParams();
  const [pembeli, setPembeli] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alamatList, setAlamatList] = useState([]);
  const [selectedAlamat, setSelectedAlamat] = useState(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id_user || user?.id;

  // Fetch pembeli and alamat list
  const fetchPembeliAndAlamat = async () => {
    setLoading(true);
    try {
      const data = await getPembeliByUserId(userId);
      setPembeli(data);
      const alamatData = await getAlamatByPembeliId(data.id_pembeli);
      setAlamatList(alamatData.length > 0 ? alamatData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPembeliAndAlamat();
  }, [userId]);

  const handleCreateAlamat = async (alamatData) => {
    try {
      const newAlamat = await createAlamat({ ...alamatData, id_pembeli: pembeli.id_pembeli });
      // Update alamatList using functional update to avoid stale closure issues
      setAlamatList(prev => [...prev, newAlamat]);
      // Reset selection so form input is cleared for new entry
      setSelectedAlamat(null);
      // Optionally re-fetch alamat data to ensure fresh sync with backend
      // await fetchPembeliAndAlamat();
    } catch (err) {
      console.error("Error creating alamat:", err);
      setError(err.message || "Failed to create alamat");
    }
  };

  const handleEditAlamat = async (alamatData) => {
    try {
      const updatedAlamat = await updateAlamat(selectedAlamat.id_alamat, alamatData);
      setAlamatList(prev => prev.map(alamat => 
        alamat.id_alamat === updatedAlamat.id_alamat ? updatedAlamat : alamat
      ));
      setSelectedAlamat(null);
      // Optionally re-fetch alamat data if immediate update fails
      // await fetchPembeliAndAlamat();
    } catch (err) {
      console.error("Error updating alamat:", err);
      setError(err.message || "Failed to update alamat");
    }
  };


  const handleDeleteAlamat = async (id_alamat) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus alamat ini?")) return;
    try {
      await deleteAlamat(id_alamat);
      setAlamatList(prev => prev.filter(alamat => alamat.id_alamat !== id_alamat));
    } catch (err) {
      console.error("Error deleting alamat:", err);
      setError(err.message || "Failed to delete alamat");
    }
  };

  const handleLogout = async () => {
    try {
      await Logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container py-4">
      <h2>Profile Pembeli</h2>
      {pembeli ? (
        <>
          <PembeliCard pembeli={pembeli} />
          <h3>Manage Alamat</h3>
          <AlamatForm
            onSubmit={selectedAlamat ? handleEditAlamat : handleCreateAlamat}
            existingAlamat={selectedAlamat}
            onCancel={() => setSelectedAlamat(null)}
          />
          <h4 className="mt-4">Daftar Alamat</h4>
          <table className="table table-bordered mt-3">
            <thead className="thead-light">
              <tr>
                <th>Label</th>
                <th>Alamat Lengkap</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alamatList.length > 0 ? (
                alamatList.map((alamat, index) => {
                  const key = alamat.id_alamat ?? index;
                  return (
                    <tr key={key}>
                      <td>{alamat.label_alamat}</td>
                      <td>{alamat.alamat_lengkap}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedAlamat(alamat)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm m-2"
                          onClick={() => handleDeleteAlamat(alamat.id_alamat)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">Belum ada alamat</td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span className="ms-2">Logout</span>
          </button>
        </>
      ) : (
        <p>No pembeli data available.</p>
      )}
    </div>
  );
};

export default DashboardProfilePembeli;