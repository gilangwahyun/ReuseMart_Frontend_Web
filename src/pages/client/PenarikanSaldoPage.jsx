import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Button, Modal } from 'react-bootstrap';
import { FaCalendarPlus } from 'react-icons/fa';
import { getPenitipByUserId, tarikSaldo } from "../../api/PenitipApi";

const PenarikanSaldo = ({ idUser }) => {
  const [penitip, setPenitip] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nominalInput, setNominalInput] = useState('');

  useEffect(() => {
    if (!idUser) {
      setError("ID User tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchDataPenitip();
  }, [idUser]);

  const fetchDataPenitip = async () => {
    try {
      setLoading(true);
      const response = await getPenitipByUserId(idUser);
      setPenitip(response);
    } catch (err) {
      setError("Gagal memuat data: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  const penitipData = penitip.data || penitip;
  const name = penitipData?.nama_penitip || "Penitip";
  const idPenitip = penitipData?.id_penitip;
  const saldo = penitipData?.saldo || 0;
  const nominalTarik = penitipData?.nominal_tarik || 0;

  const handleTarikSaldo = async () => {
    const nominal = Number(nominalInput);

    if (!nominal || isNaN(nominal) || nominal <= 0) {
        setError("Nominal tidak valid.");
        return;
    }

    try {
        setError(null);

        const data = { nominal_tarik: nominal };

        const response = await tarikSaldo(idPenitip, data);

        if (response?.message === "Penitip berhasil diperbarui") {
            setSuccessMessage("Penarikan saldo berhasil.");
            setShowModal(false);
            setNominalInput('');
            fetchDataPenitip();
        } else {
        setError(response?.message || "Terjadi kesalahan.");
        }
    } catch (err) {
        setError(err.message || "Gagal melakukan penarikan saldo.");
    }
    };

  return (
    <>
      {/* Notifikasi Sukses */}
      {successMessage && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Notifikasi Error */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="profile-container">
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <div className="bg-success text-white p-4 position-relative">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-white rounded-circle p-3 me-3" />
              <div>
                <h4 className="mb-0 fw-bold">{name}</h4>
                <h4 className="mb-0 fw-bold">ID: {idPenitip}</h4>
              </div>
            </div>
          </div>

          <Card.Body className="p-4">
            <div className="mb-4">
              <h5 className="text-success mb-3 border-bottom pb-2">Informasi Pribadi</h5>
            </div>

            <div className="reward-section bg-light p-3 rounded">
              <div className="d-flex justify-content-between align-items-start flex-wrap">
                <div className="me-4 mb-3">
                  <h5 className="mb-0">Saldo</h5>
                  <Badge bg="success" className="fs-5 py-2 px-3 rounded-pill mt-2">
                    Rp {saldo.toLocaleString()}
                  </Badge>
                  <p className="text-muted small mt-2 mb-0">Saldo dari hasil penjualan barang Anda</p>
                </div>
                <div className="mb-3">
                  <h5 className="mb-0">Nominal Tarik Saldo</h5>
                  <Badge bg="success" className="fs-5 py-2 px-3 rounded-pill mt-2">
                    Rp {nominalTarik.toLocaleString()}
                  </Badge>
                  <p className="text-muted small mt-2 mb-0">Jumlah Nominal Saldo yang Anda Tarik.</p>
                </div>
              </div>
              <Button variant="success" className="mt-4" onClick={() => setShowModal(true)}>
                <FaCalendarPlus className="me-2" />
                Tarik Saldo
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Modal Tarik Saldo */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tarik Saldo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Masukkan nominal yang ingin ditarik:</label>
          <input
            type="number"
            className="form-control"
            value={nominalInput}
            onChange={(e) => setNominalInput(e.target.value)}
            placeholder="Contoh: 100000"
          />
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
          <Button variant="success" onClick={handleTarikSaldo}>Tarik</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PenarikanSaldo;