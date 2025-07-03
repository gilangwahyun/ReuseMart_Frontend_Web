import { useState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";

const RegisterPenitip = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Penitip', // Default role is set to "Penitip"
    nama_penitip: '',
    nik: '',
    no_telepon: '',
    alamat: '',
    saldo: '0',
    jumlah_poin: '0',
    foto_ktp: null,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    if (e.target.name === 'foto_ktp') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    
    // Clear validation error when field is edited
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) errors.email = 'Email harus diisi';
    if (!formData.password || formData.password.length < 6) 
      errors.password = 'Password minimal 6 karakter';
    if (!formData.nama_penitip) errors.nama_penitip = 'Nama harus diisi';
    if (!formData.nik || formData.nik.length !== 16) 
      errors.nik = 'NIK harus 16 digit';
    if (!formData.no_telepon) errors.no_telepon = 'Nomor telepon harus diisi';
    if (!formData.alamat) errors.alamat = 'Alamat harus diisi';
    if (!formData.foto_ktp) errors.foto_ktp = 'Foto KTP harus diunggah';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Create FormData object for file uploads
    const data = new FormData();
    
    // Add all form fields to FormData
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }
    
    // Use the onSubmit prop to pass the form data to the parent component
    // This will handle creating both User and Penitip records
    if (typeof onSubmit === 'function') {
      onSubmit(data);
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
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!validationErrors.email}
            required
          />
          {validationErrors.email && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!validationErrors.password}
            required
          />
          {validationErrors.password && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.password}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      {/* Hidden field for role - always set to "Penitip" */}
      <input type="hidden" name="role" value="Penitip" />

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Nama Penitip</Form.Label>
          <Form.Control
            type="text"
            name="nama_penitip"
            value={formData.nama_penitip}
            onChange={handleChange}
            isInvalid={!!validationErrors.nama_penitip}
            required
          />
          {validationErrors.nama_penitip && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.nama_penitip}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md={6}>
          <Form.Label>NIK</Form.Label>
          <Form.Control
            type="text"
            name="nik"
            value={formData.nik}
            onChange={handleChange}
            isInvalid={!!validationErrors.nik}
            required
          />
          {validationErrors.nik && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.nik}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>No Telepon</Form.Label>
          <Form.Control
            type="text"
            name="no_telepon"
            value={formData.no_telepon}
            onChange={handleChange}
            isInvalid={!!validationErrors.no_telepon}
            required
          />
          {validationErrors.no_telepon && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.no_telepon}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Foto KTP</Form.Label>
          <Form.Control
            type="file"
            name="foto_ktp"
            accept="image/*"
            onChange={handleChange}
            isInvalid={!!validationErrors.foto_ktp}
            required
          />
          {validationErrors.foto_ktp && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.foto_ktp}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <Form.Label>Alamat</Form.Label>
          <Form.Control
            type="text"
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            isInvalid={!!validationErrors.alamat}
            required
          />
          {validationErrors.alamat && (
            <Form.Control.Feedback type="invalid">
              {validationErrors.alamat}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Row>

      <Button variant="success" type="submit" disabled={loading}>
        {loading ? "Mendaftar..." : "Daftar Penitip"}
      </Button>
    </Form>
  );
};

export default RegisterPenitip;