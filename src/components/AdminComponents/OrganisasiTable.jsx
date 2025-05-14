import React from "react";

const OrganisasiTable = ({ data, onEdit, onDelete }) => {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Alamat</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((org, index) => (
          <tr key={index}>
            <td>{org.nama}</td>
            <td>{org.alamat}</td>
            <td>
              <button
                className="btn btn-sm btn-warning me-2"
                onClick={() => onEdit(org)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(org.id)}
              >
                Hapus
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrganisasiTable;