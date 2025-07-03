import React from "react";

const PegawaiTable = ({ data, onEdit, onDelete }) => {
  return (
    <>
      {data.length === 0 ? (
        <div>Tidak ada data pegawai yang cocok.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tanggal Lahir</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Jabatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pegawai, index) => {
                const jabatan =
                  pegawai.jabatan?.nama_jabatan || pegawai.nama_jabatan || "-";

                return (
                  <tr key={pegawai.id_pegawai || Math.random()}>
                    <td>{index + 1}</td>
                    <td>{pegawai.nama_pegawai}</td>
                    <td>{pegawai.tanggal_lahir}</td>
                    <td>{pegawai.no_telepon}</td>
                    <td>{pegawai.alamat}</td>
                    <td>{jabatan}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => onEdit(pegawai)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(pegawai.id_pegawai)}
                      >
                        Hapus
                      </button>
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

export default PegawaiTable;