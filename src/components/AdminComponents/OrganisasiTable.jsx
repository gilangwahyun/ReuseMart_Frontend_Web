import React from "react";

const OrganisasiTable = ({ data, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nama Organisasi</th>
            <th>Alamat</th>
            <th>No. Telepon</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((org) => (
            <tr key={org.id_organisasi}>
              <td>{org.nama_organisasi}</td>
              <td>{org.alamat}</td>
              <td>{org.no_telepon}</td>
              <td>
                {org.deskripsi && org.deskripsi.length > 50
                  ? `${org.deskripsi.substring(0, 50)}...`
                  : org.deskripsi}
              </td>
              <td>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => onEdit({
                      id: org.id_organisasi,
                      nama_organisasi: org.nama_organisasi,
                      alamat: org.alamat,
                      no_telepon: org.no_telepon,
                      deskripsi: org.deskripsi
                    })}
                  >
                    <i className="bi bi-pencil-fill"></i> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(org.id_organisasi)}
                  >
                    <i className="bi bi-trash-fill"></i> Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganisasiTable;