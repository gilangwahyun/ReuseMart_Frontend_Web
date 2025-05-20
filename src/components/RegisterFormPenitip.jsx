import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function RegisterFormPenitip({ onSubmit, loading }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "penitip", // bisa hidden, atau select jika multi-role
    nama_penitip: "",
    nik: "",
    nomor_ktp: "",
    no_telepon: "",
    alamat: "",
    saldo: "",
    jumlah_poin: "",
  });
  const [fotoKtp, setFotoKtp] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFotoKtp(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (fotoKtp) {
      formData.append('foto_ktp', fotoKtp);
    }
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      {/* Role bisa hidden jika hanya penitip */}
      <input type="hidden" name="role" value="penitip" />

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
        <Form.Group as={Col} md={6}>
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
          <Form.Label>Foto KTP</Form.Label>
          <Form.Control
            type="file"
            name="foto_ktp"
            accept="image/*"
            onChange={handleFileChange}
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
        {loading ? "Mendaftar..." : "Daftar Penitip"}
      </Button>
    </Form>
  );
}
