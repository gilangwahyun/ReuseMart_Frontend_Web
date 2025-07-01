import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { BASE_URL } from "../../api/index";

const PenitipTable = ({ data, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleShowImage = (imagePath) => {
    setSelectedImage(`${BASE_URL}/${imagePath}`);
    setShowModal(true);
  };
  
  return (
    <>
      {data.length === 0 ? (
        <div>Tidak ada data penitip yang cocok.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-success">
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIK</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Saldo</th>
                <th>Poin</th>
                <th>KTP</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((penitip, index) => (
                <tr key={penitip.id_penitip || Math.random()}>
                  <td>{index + 1}</td>
                  <td>{penitip.nama_penitip}</td>
                  <td>{penitip.nik}</td>
                  <td>{penitip.no_telepon}</td>
                  <td>{penitip.alamat}</td>
                  <td>Rp {Number(penitip.saldo || 0).toLocaleString('id-ID')}</td>
                  <td>{penitip.jumlah_poin || 0}</td>
                  <td className="text-center">
                    {penitip.foto_ktp ? (
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleShowImage(penitip.foto_ktp)}
                      >
                        Lihat KTP
                      </button>
                    ) : (
                      <span className="badge bg-secondary">Tidak ada</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => onEdit(penitip)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(penitip.id_penitip)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal untuk menampilkan foto KTP */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Foto KTP</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Foto KTP" 
              style={{ maxWidth: '100%', maxHeight: '500px' }} 
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PenitipTable; 