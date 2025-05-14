import React, { useState } from 'react';
import { updateAlokasiDonasi } from "../../api/AlokasiDonasiApi";

const RiwayatAlokasiDonasiTable = ({ alokasiDonasi = [], setAlokasiDonasi }) => {  
  const [isEditing, setIsEditing] = useState(null);
  const [tanggalDonasi, setTanggalDonasi] = useState('');
  const [namaPenerima, setNamaPenerima] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (id_alokasi_donasi) => {
    try {
      setLoading(true);
      const updatedAlokasi = await updateAlokasiDonasi(id_alokasi_donasi, {
        tanggal_donasi: tanggalDonasi,
        nama_penerima: namaPenerima,
      });

      const updatedData = alokasiDonasi.map((alokasi) =>
        alokasi.id_alokasi_donasi === id_alokasi_donasi
          ? { ...alokasi, tanggal_donasi: tanggalDonasi, nama_penerima: namaPenerima }
          : alokasi
      );

      setAlokasiDonasi(updatedData);
      setIsEditing(null);
      setTanggalDonasi('');
      setNamaPenerima('');
    } catch (error) {
      console.error('Gagal memperbarui data alokasi donasi', error);
      alert('Terjadi kesalahan saat memperbarui alokasi donasi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alokasi) => {
    setIsEditing(alokasi.id_alokasi_donasi);
    setTanggalDonasi(alokasi.tanggal_donasi || '');
    setNamaPenerima(alokasi.nama_penerima || '');
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>No</th>
            <th>Organisasi</th>
            <th>Tanggal Pengajuan</th>
            <th>Tanggal Donasi</th>
            <th>Nama Penerima</th>
            <th>Barang</th>
            <th>Nama Penitip</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {alokasiDonasi.map((alokasi, index) => (
            <tr key={alokasi.id_alokasi_donasi}>
              <td>{index + 1}</td>
              <td>{alokasi.request_donasi?.organisasi?.nama_organisasi || '-'}</td>
              <td>{alokasi.request_donasi?.tanggal_pengajuan || '-'}</td>
              <td>
                {isEditing === alokasi.id_alokasi_donasi ? (
                  <input
                    type="date"
                    value={tanggalDonasi}
                    onChange={(e) => setTanggalDonasi(e.target.value)}
                    disabled={loading}
                  />
                ) : (
                  alokasi.tanggal_donasi || '-'
                )}
              </td>
              <td>
                {isEditing === alokasi.id_alokasi_donasi ? (
                  <input
                    type="text"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    disabled={loading}
                  />
                ) : (
                  alokasi.nama_penerima || '-'
                )}
              </td>
              <td>{alokasi.barang?.nama_barang || '-'}</td>
              <td>{alokasi.barang?.penitipan_barang?.penitip?.nama_penitip ?? '-'}</td>
              <td>
                {isEditing === alokasi.id_alokasi_donasi ? (
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdate(alokasi.id_alokasi_donasi)}
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(alokasi)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiwayatAlokasiDonasiTable;