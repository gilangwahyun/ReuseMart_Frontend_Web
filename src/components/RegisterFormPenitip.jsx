import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";


const RegisterPenitip = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Penitip',
    nama_penitip: '',
    nik: '',
    nomor_ktp: '',
    no_telepon: '',
    alamat: '',
    saldo: '',
    jumlah_poin: '',
    foto_ktp: null,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'foto_ktp') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      const res = await axios.post('/api/register-penitip', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Registrasi berhasil!');
      console.log(res.data);
    } catch (err) {
      setMessage('Registrasi gagal!');
      console.error(err.response?.data || err.message);
    }
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
};

export default RegisterPenitip;