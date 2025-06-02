import React, { useState } from 'react';
import { updateAlokasiDonasi } from "../../api/AlokasiDonasiApi";

const RiwayatAlokasiDonasiTable = ({ alokasiDonasi = [], setAlokasiDonasi, onDataUpdated }) => {
  const [isEditing, setIsEditing] = useState(null);
  const [tanggalDonasi, setTanggalDonasi] = useState('');
  const [namaPenerima, setNamaPenerima] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (id_alokasi_donasi) => {
    try {
      setLoading(true);

      const original = alokasiDonasi.find((a) => a.id_alokasi_donasi === id_alokasi_donasi);
      if (
        original.tanggal_donasi === tanggalDonasi &&
        original.nama_penerima === namaPenerima
      ) {
        alert("Tidak ada perubahan yang dilakukan.");
        return;
      }

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
      
      // Memanggil callback untuk refresh data
      if (onDataUpdated) {
        onDataUpdated();
      }
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

  const handleCancel = () => {
    setIsEditing(null);
    setTanggalDonasi('');
    setNamaPenerima('');
  };

  if (!Array.isArray(alokasiDonasi) || alokasiDonasi.length === 0) {
    return <div>Tidak ada data alokasi donasi.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped align-middle">
        <thead className="table-dark">
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
              <td>{alokasi.request_donasi?.tanggal_pengajuan?.split(" ")[0] || '-'}</td>
              <td>
                {isEditing === alokasi.id_alokasi_donasi ? (
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={tanggalDonasi}
                    onChange={(e) => setTanggalDonasi(e.target.value)}
                    disabled={loading}
                  />
                ) : (
                  alokasi.tanggal_donasi?.split(" ")[0] || '-'
                )}
              </td>
              <td>
                {isEditing === alokasi.id_alokasi_donasi ? (
                  <input
                    type="text"
                    className="form-control form-control-sm"
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
                  <>
                    <button
                      className="btn btn-success btn-sm me-1"
                      onClick={() => handleUpdate(alokasi.id_alokasi_donasi)}
                      disabled={loading}
                    >
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
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