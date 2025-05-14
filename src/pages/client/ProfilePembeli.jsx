import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPembeli } from '../../api/PembeliApi';
import { createAlamat, updateAlamat, getAlamatByPembeliId ,deleteAlamat} from '../../api/AlamatApi';
import PembeliCard from '../../components/PembeliCard';
import AlamatForm from '../../components/AlamatForm';

const ProfilePembeli = () => {
  const { id } = useParams();
  const [pembeli, setPembeli] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alamatList, setAlamatList] = useState([]);
  const [selectedAlamat, setSelectedAlamat] = useState(null);

  useEffect(() => {
    const fetchPembeliAndAlamat = async () => {
      setLoading(true);
      try {
        const data = await getPembeli(id);
        setPembeli(data);

        const alamatData = await getAlamatByPembeliId(id);
        setAlamatList(alamatData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchPembeliAndAlamat();
  }, [id]);

  const handleCreateAlamat = async (alamatData) => {
    try {
      const newAlamat = await createAlamat({ ...alamatData, id_pembeli: pembeli.id_pembeli });
      setAlamatList([...alamatList, newAlamat]);
    } catch (err) {
      console.error("Error creating alamat:", err);
      setError(err.message || "Failed to create alamat");
    }
  };

  const handleEditAlamat = async (alamatData) => {
    try {
      const updatedAlamat = await updateAlamat(selectedAlamat.id_alamat, alamatData);
      setAlamatList(alamatList.map(alamat =>
        alamat.id_alamat === updatedAlamat.id_alamat ? updatedAlamat : alamat
      ));
      setSelectedAlamat(null);
    } catch (err) {
      console.error("Error updating alamat:", err);
      setError(err.message || "Failed to update alamat");
    }
  };

  const handleDeleteAlamat = async (id_alamat) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus alamat ini?")) return;

    try {
        await deleteAlamat(id_alamat);
        setAlamatList(alamatList.filter(alamat => alamat.id_alamat !== id_alamat));
    } catch (err) {
        console.error("Error deleting alamat:", err);
        setError(err.message || "Failed to delete alamat");
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
                alamatList.map((alamat) => (
                  <tr key={alamat.id_alamat}>
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
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">Belum ada alamat</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <p>No pembeli data available.</p>
      )}
    </div>
  );
};

export default ProfilePembeli;