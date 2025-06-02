import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function EditFormPenitip({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState(initialData);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Nama Penitip</Form.Label>
          <Form.Control
            type="text"
            name="nama_penitip"
            value={form.nama_penitip}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>NIK</Form.Label>
          <Form.Control
            type="text"
            name="nik"
            value={form.nik}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>No Telepon</Form.Label>
          <Form.Control
            type="text"
            name="no_telepon"
            value={form.no_telepon}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Alamat</Form.Label>
          <Form.Control
            type="text"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md={6}>
          <Form.Label>Saldo</Form.Label>
          <Form.Control
            type="number"
            name="saldo"
            value={form.saldo}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group as={Col} md={6}>
          <Form.Label>Jumlah Poin</Form.Label>
          <Form.Control
            type="number"
            name="jumlah_poin"
            value={form.jumlah_poin}
            onChange={handleChange}
          />
        </Form.Group>
      </Row>

      <Button variant="success" type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </Form>
  );
}
