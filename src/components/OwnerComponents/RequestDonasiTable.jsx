import { useState, useEffect } from "react";
import ModalAlokasiDonasi from "../../components/OwnerComponents/ModalAlokasiDonasi";
import { getAllDonateBarang } from "../../api/BarangApi";
import { createAlokasiDonasi } from "../../api/AlokasiDonasiApi";

const RequestDonasiTable = ({ data, onDataUpdated }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [loading, setLoading] = useState(false);

  const openModal = (request) => {
    setSelectedRequest(request);
    fetchBarang();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setSelectedBarang(null);
  };

  const fetchBarang = async () => {
    try {
      const response = await getAllDonateBarang();
      console.log(response.data);
      setBarangList(response.data);
    } catch (error) {
      console.error("Gagal memuat data barang:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createAlokasiDonasi({
        id_request_donasi: selectedRequest.id_request_donasi,
        id_barang: selectedBarang,
      });

      alert("Donasi berhasil dialokasikan");
      closeModal();
      
      // Memicu refresh data melalui callback
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error("Gagal menyetujui donasi:", error);
      alert("Terjadi kesalahan saat menyetujui donasi");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div>Data request donasi tidak ditemukan.</div>;
  if (!Array.isArray(data)) return <div>Data tidak dalam format yang benar.</div>;
  if (data.length === 0) return <div>Tidak ada data request donasi.</div>;

  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>No</th>
              <th>Deskripsi</th>
              <th>Tanggal Pengajuan</th>
              <th>Status Pengajuan</th>
              <th>Organisasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((requestDonasi, index) => (
              <tr key={requestDonasi.id_request_donasi}>
                <td>{index + 1}</td>
                <td>{requestDonasi.deskripsi}</td>
                <td>{requestDonasi.tanggal_pengajuan?.split(" ")[0] || "-"}</td>
                <td>
                  {requestDonasi.status_pengajuan === "Pending" ? (
                    <span className="badge bg-warning">Pending</span>
                  ) : (
                    <span className="badge bg-success">Disetujui</span>
                  )}
                </td>
                <td>{requestDonasi.organisasi?.nama_organisasi || "-"}</td>
                <td>
                  {requestDonasi.status_pengajuan === "Pending" ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => openModal(requestDonasi)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Memproses...
                        </>
                      ) : (
                        'Setujui'
                      )}
                    </button>
                  ) : (
                    <span className="text-muted">Sudah Disetujui</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalAlokasiDonasi
        show={showModal}
        onClose={closeModal}
        barangList={barangList}
        selectedBarang={selectedBarang}
        onSelectBarang={setSelectedBarang}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
};

export default RequestDonasiTable;