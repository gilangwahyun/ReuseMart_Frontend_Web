import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

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
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Buat Request Donasi Baru</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Deskripsi</Form.Label>
            <Form.Control
              type="text"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
              placeholder="Masukkan deskripsi request donasi"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Tanggal Pengajuan</Form.Label>
            <Form.Control
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </Form.Group>
          
          <Button variant="success" type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Buat Request'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BuatRequestDonasi;
