import { useState, useEffect } from "react";
import ModalAlokasiDonasi from "../../components/OwnerComponents/ModalAlokasiDonasi";
import { getAllDonateBarang } from "../../api/BarangApi";
import { createAlokasiDonasi } from "../../api/AlokasiDonasiApi";

const RequestDonasiTable = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);

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
    try {
      await createAlokasiDonasi({
        id_request_donasi: selectedRequest.id_request_donasi,
        id_barang: selectedBarang,
      });

      alert("Donasi berhasil dialokasikan");
      closeModal();
    } catch (error) {
      console.error("Gagal menyetujui donasi:", error);
      alert("Terjadi kesalahan saat menyetujui donasi");
    }
  };

  if (!data) return <div>Data request donasi tidak ditemukan.</div>;
  if (!Array.isArray(data)) return <div>Data tidak dalam format yang benar.</div>;

  return (
    <>
      {data.length === 0 ? (
        <div>Tidak ada data request donasi.</div>
      ) : (
        <table className="table table-striped">
          <thead>
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
                <td>{requestDonasi.tanggal_pengajuan}</td>
                <td>{requestDonasi.status_pengajuan}</td>
                <td>{requestDonasi.organisasi?.nama_organisasi || "-"}</td>
                <td>
                  {requestDonasi.status_pengajuan === "Pending" ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => openModal(requestDonasi)}
                    >
                      Setujui
                    </button>
                  ) : (
                    <span className="text-muted">Sudah Disetujui</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ModalAlokasiDonasi
        show={showModal}
        onClose={closeModal}
        barangList={barangList}
        selectedBarang={selectedBarang}
        onSelectBarang={setSelectedBarang}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default RequestDonasiTable;