import React from "react";

const KlaimMerchandiseTable = ({ data, onUpdateStatus }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Diproses":
        return "bg-primary"; // Biru
      case "Belum Diambil":
        return "bg-warning"; // Kuning
      case "Sudah Diambil":
        return "bg-success"; // Hijau
      default:
        return "bg-secondary"; // Abu-abu
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "Diproses":
        return { status: "Belum Diambil", label: "Siap Diambil", btnClass: "btn-warning" };
      case "Belum Diambil":
        return { status: "Sudah Diambil", label: "Selesai", btnClass: "btn-success" };
      default:
        return { status: "", label: "", btnClass: "" };
    }
  };

  return (
    <>
      {data.length === 0 ? (
        <div>Tidak ada data klaim merchandise.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>No</th>
                <th>Nama Pembeli</th>
                <th>Merchandise</th>
                <th>Total Poin</th>
                <th>Status Klaim</th>
                <th>Tanggal Klaim</th>
                <th>Tanggal Ambil</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((klaim, index) => {
                const nextStatus = getNextStatus(klaim.status_klaim);

                return (
                  <tr key={klaim.id_klaim || Math.random()}>
                    <td>{index + 1}</td>
                    <td>{klaim.pembeli?.nama_pembeli || "-"}</td>
                    <td>{klaim.merchandise?.nama_merchandise || "-"}</td>
                    <td>{klaim.total_poin}</td>
                    <td>
                      <span 
                        className={`badge ${getStatusBadgeClass(klaim.status_klaim)}`}
                      >
                        {klaim.status_klaim || "-"}
                      </span>
                    </td>
                    <td>{klaim.tanggal_klaim || "-"}</td>
                    <td>{klaim.tanggal_ambil || "-"}</td>
                    <td>
                      {klaim.status_klaim !== "Sudah Diambil" && nextStatus.status && (
                        <button
                          className={`btn btn-sm ${nextStatus.btnClass}`}
                          onClick={() => onUpdateStatus(klaim.id_klaim, nextStatus.status)}
                        >
                          {nextStatus.label}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default KlaimMerchandiseTable; 