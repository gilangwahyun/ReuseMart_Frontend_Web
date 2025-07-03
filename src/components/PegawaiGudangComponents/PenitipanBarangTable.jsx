import { useNavigate } from "react-router-dom";

const PenitipanBarangTable = ({ barangData }) => {
  const navigate = useNavigate();

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format tanggal dan waktu
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  const hitungSelisihHari = (tanggalAkhir) => {
    if (!tanggalAkhir) return '-';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(tanggalAkhir);
    endDate.setHours(0, 0, 0, 0);
    
    const selisihMasaTitip = endDate - today;
    const selisihHari = Math.ceil(selisihMasaTitip / (1000 * 60 * 60 * 24));

    // Jika masih dalam masa penitipan normal
    if (selisihHari > 0) {
      return `${selisihHari} hari lagi`;
    } 
    // Jika hari ini hari terakhir penitipan
    else if (selisihHari === 0) {
      return "Hari terakhir penitipan";
    }
    // Jika sudah masuk masa tenggang
    else {
      const hariTenggang = 7 + selisihHari; // selisihHari negatif
      if (hariTenggang > 0) {
        return `Masa tenggang: ${hariTenggang} hari`;
      } else if (hariTenggang === 0) {
        return "Hari terakhir masa tenggang";
      } else {
        return `Sudah lewat masa tenggang`;
      }
    }
  };

  // Fungsi untuk menentukan warna badge berdasarkan status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Aktif':
        return 'bg-success';
      case 'Non Aktif':
        return 'bg-danger';
      case 'Habis':
        return 'bg-secondary';
      case 'Barang untuk Donasi':
        return 'bg-info';
      case 'Didonasikan':
        return 'bg-primary';
      default:
        return 'bg-warning';
    }
  };

  // Fungsi untuk menentukan ikon badge berdasarkan status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Aktif':
        return 'fas fa-check-circle';
      case 'Non Aktif':
        return 'fas fa-times-circle';
      case 'Habis':
        return 'fas fa-box';
      case 'Barang untuk Donasi':
        return 'fas fa-hand-holding-heart';
      case 'Didonasikan':
        return 'fas fa-gift';
      default:
        return 'fas fa-exclamation-circle';
    }
  };

  if (!Array.isArray(barangData) || barangData.length === 0) {
    return <div>Tidak ada data penitipan barang.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th className="align-middle">No</th>
            <th className="align-middle">ID Barang</th>
            <th className="align-middle">Nama Barang</th>
            <th className="align-middle">Kategori</th>
            <th className="align-middle">Harga (Rp)</th>
            <th className="align-middle">Berat (g)</th>
            <th className="align-middle">Status Barang</th>
            <th className="align-middle">Status Garansi</th>
            <th className="align-middle">Penitip</th>
            <th className="align-middle">Tgl Awal</th>
            <th className="align-middle">Masa Penitipan</th>
            <th className="align-middle">Tgl Akhir</th>
            <th className="align-middle">Petugas QC</th>
            <th className="align-middle">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {barangData.map((barang, index) => {
            const penitipan = barang.penitipan_barang;
            const penitip = penitipan?.penitip;

            return (
              <tr key={barang.id_barang}>
                <td className="align-middle">{index + 1}</td>
                <td className="align-middle">{barang.id_barang}</td>
                <td className="align-middle">{barang.nama_barang}</td>
                <td className="align-middle">{barang.kategori?.nama_kategori || "-"}</td>
                <td className="align-middle">{barang.harga.toLocaleString("id-ID")}</td>
                <td className="align-middle">{barang.berat}</td>
                <td className="align-middle">
                  <span className={`badge ${getStatusBadgeClass(barang.status_barang)}`}>
                    {barang.status_barang}
                  </span>
                </td>
                <td className="align-middle">
                  {barang.masa_garansi ? (
                    <div>
                      <span className="badge bg-success">Ya</span>
                      <div className="small mt-1">{formatDate(barang.masa_garansi)}</div>
                    </div>
                  ) : (
                    <span className="badge bg-danger">Tidak</span>
                  )}
                </td>
                <td className="align-middle">{penitip?.nama_penitip || "-"}</td>
                <td className="align-middle">{formatDate(penitipan?.tanggal_awal_penitipan)}</td>
                <td className="align-middle">
                  {hitungSelisihHari(penitipan?.tanggal_akhir_penitipan)}
                </td>
                <td className="align-middle">{formatDate(penitipan?.tanggal_akhir_penitipan)}</td>
                <td className="align-middle">{penitipan?.nama_petugas_qc || "-"}</td>
                <td className="align-middle">
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