import { useNavigate } from "react-router-dom";

const PenitipanBarangTable = ({ barangData }) => {
  const navigate = useNavigate();

  if (!Array.isArray(barangData) || barangData.length === 0) {
    return <div>Tidak ada data penitipan barang.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped align-middle">
        <thead className="table-dark">
          <tr>
            <th>No</th>
            <th>Nama Barang</th>
            <th>Kategori</th>
            <th>Harga (Rp)</th>
            <th>Berat (g)</th>
            <th>Status Barang</th>
            <th>Penitip</th>
            <th>Tgl Awal</th>
            <th>Tgl Akhir</th>
            <th>Petugas QC</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {barangData.map((barang, index) => {
            const penitipan = barang.penitipan_barang;
            const penitip = penitipan?.penitip;

            return (
              <tr key={barang.id_barang}>
                <td>{index + 1}</td>
                <td>{barang.nama_barang}</td>
                <td>{barang.kategori?.nama_kategori || "-"}</td>
                <td>{barang.harga.toLocaleString("id-ID")}</td>
                <td>{barang.berat}</td>
                <td>{barang.status_barang}</td>
                <td>{penitip?.nama_penitip || "-"}</td>
                <td>{penitipan?.tanggal_awal_penitipan?.split(" ")[0] || "-"}</td>
                <td>{penitipan?.tanggal_akhir_penitipan?.split(" ")[0] || "-"}</td>
                <td>{penitipan?.nama_petugas_qc || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/barang/${barang.id_barang}`)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PenitipanBarangTable;