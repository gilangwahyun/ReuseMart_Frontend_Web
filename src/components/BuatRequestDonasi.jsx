import React, { useState } from 'react';

const BuatRequestDonasi = ({ onCreate }) => {
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({
      deskripsi,
      tanggal_pengajuan: tanggal,
      status_pengajuan: 'Pending',
    });
    setDeskripsi('');
    setTanggal('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Buat Request Donasi Baru</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Deskripsi: </label>
        <input
          type="text"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          required
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Tanggal Pengajuan: </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Buat Request'}
      </button>
    </form>
  );
};

export default BuatRequestDonasi;
