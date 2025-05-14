import React, { useState } from 'react';

const ListRequestDonasi = ({ requests, onDelete, onEdit }) => {
  const [editId, setEditId] = useState(null);
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const startEdit = (req) => {
    setEditId(req.id_request_donasi);
    setEditDeskripsi(req.deskripsi);
    setEditTanggal(req.tanggal_pengajuan);
    setEditStatus(req.status_pengajuan);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editId, {
      deskripsi: editDeskripsi,
      tanggal_pengajuan: editTanggal,
      status_pengajuan: editStatus,
    });
    setEditId(null);
  };

  return (
    <div>
      <h2>Daftar Request Donasi</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Deskripsi</th>
            <th>Tanggal Pengajuan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {requests && requests.length > 0 ? (
            requests.map((req) =>
              editId === req.id_request_donasi ? (
                <tr key={req.id_request_donasi}>
                  <td>{req.id_request_donasi}</td>
                  <td>
                    <input
                      value={editDeskripsi}
                      onChange={e => setEditDeskripsi(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editTanggal}
                      onChange={e => setEditTanggal(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={editStatus}
                      readOnly
                      style={{ background: '#eee', color: '#888' }}
                    />
                  </td>
                  <td>
                    <button onClick={handleEditSubmit}>Simpan</button>
                    <button onClick={() => setEditId(null)}>Batal</button>
                  </td>
                </tr>
              ) : (
                <tr key={req.id_request_donasi}>
                  <td>{req.id_request_donasi}</td>
                  <td>{req.deskripsi}</td>
                  <td>{req.tanggal_pengajuan}</td>
                  <td>{req.status_pengajuan}</td>
                  <td>
                    <button onClick={() => startEdit(req)}>Edit</button>
                    <button onClick={() => onDelete(req.id_request_donasi)}>Delete</button>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '8px' }}>Belum ada request donasi.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListRequestDonasi;
