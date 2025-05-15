import React, { useState, useEffect } from 'react';
import OwnerSideBar from "../../components/OwnerSideBar";
import RiwayatAlokasiDonasiTable from '../../components/OwnerComponents/RiwayatAlokasiDonasiTable';
import { getAllAlokasiDonasi, searchByOrganisasi } from "../../api/AlokasiDonasiApi";

const RiwayatAlokasiDonasi = () => {
  const [alokasiDonasi, setAlokasiDonasi] = useState([]);
  const [filteredAlokasiDonasi, setFilteredAlokasiDonasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchAlokasiDonasi = async () => {
      try {
        const response = await getAllAlokasiDonasi();
        if (response && Array.isArray(response)) {
          setAlokasiDonasi(response);
          setFilteredAlokasiDonasi(response);
        } else {
          throw new Error('Data tidak valid');
        }
      } catch (error) {
        console.error('Gagal mengambil data alokasi donasi', error);
        setError('Gagal mengambil data alokasi donasi.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlokasiDonasi();
  }, []);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchError(null);

    if (query) {
      try {
        const result = await searchByOrganisasi(query);
        setFilteredAlokasiDonasi(result);
      } catch (err) {
        if (err.response?.status === 404) {
          setFilteredAlokasiDonasi([]);
          setSearchError('Tidak ada data alokasi donasi yang cocok.');
        } else {
          console.error("Search error:", err);
          setSearchError('Terjadi kesalahan saat mencari data.');
        }
      }
    } else {
      // Jika input dikosongkan, reset ke semua data
      setFilteredAlokasiDonasi(alokasiDonasi);
    }
  };

  return (
    <div className="d-flex">
      <OwnerSideBar />
      <div className="p-4 w-100">
        <h3>Riwayat Alokasi Donasi</h3>

        {/* Error saat load awal */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Input pencarian */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Cari organisasi"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {/* Error pencarian */}
          {searchError && (
            <div className="text-danger mt-1">{searchError}</div>
          )}
        </div>

        {/* Konten utama */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {filteredAlokasiDonasi.length === 0 && !searchError ? (
              <div className="alert alert-warning">
                Tidak ada data alokasi donasi yang tersedia.
              </div>
            ) : (
              <RiwayatAlokasiDonasiTable
                alokasiDonasi={filteredAlokasiDonasi}
                setAlokasiDonasi={setAlokasiDonasi}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiwayatAlokasiDonasi;