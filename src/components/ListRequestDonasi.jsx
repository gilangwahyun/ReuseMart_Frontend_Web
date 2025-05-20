import React, { useState } from 'react';
import { Table, Button, Form, Card } from 'react-bootstrap';

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
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Daftar Request Donasi</h5>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
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
                      <Form.Control
                        value={editDeskripsi}
                        onChange={e => setEditDeskripsi(e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={editTanggal}
                        onChange={e => setEditTanggal(e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        value={editStatus}
                        readOnly
                        disabled
                      />
                    </td>
                    <td>
                      <Button variant="success" size="sm" className="me-2" onClick={handleEditSubmit}>
                        Simpan
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditId(null)}>
                        Batal
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={req.id_request_donasi}>
                    <td>{req.id_request_donasi}</td>
                    <td>{req.deskripsi}</td>
                    <td>{req.tanggal_pengajuan}</td>
                    <td>
                      <span className={`badge ${
                        req.status_pengajuan === 'Pending' ? 'bg-warning' : 
                        req.status_pengajuan === 'Sudah Disetujui' ? 'bg-success' : 
                        req.status_pengajuan === 'Ditolak' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                        {req.status_pengajuan}
                      </span>
                    </td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => startEdit(req)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => onDelete(req.id_request_donasi)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-3">Belum ada request donasi.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ListRequestDonasi;
