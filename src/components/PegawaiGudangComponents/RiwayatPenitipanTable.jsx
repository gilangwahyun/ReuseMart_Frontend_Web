// ReuseMart_Frontend_Web/src/components/PegawaiGudangComponents/RiwayatPenitipanTable.jsx
import React from 'react';
import { FaPrint, FaEye, FaEdit } from 'react-icons/fa';

const RiwayatPenitipanTable = ({ 
  penitipanList, 
  onPrintNota, 
  onViewDetail, 
  onEditPenitipan,
  formatDate 
}) => {
  if (!Array.isArray(penitipanList) || penitipanList.length === 0) {
    return (
      <div className="alert alert-warning">
        Tidak ada data transaksi penitipan yang ditemukan.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID Penitipan</th>
            <th>Penitip</th>
            <th>Tanggal Awal</th>
            <th>Tanggal Akhir</th>
            <th>Petugas QC</th>
            <th>Hunter</th>
            <th>Jumlah Barang</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {penitipanList.map((penitipan) => (
            <tr key={penitipan.id_penitipan}>
              <td>{penitipan.id_penitipan}</td>
              <td>{penitipan.penitip?.nama_penitip || '-'}</td>
              <td>{formatDate(penitipan.tanggal_awal_penitipan)}</td>
              <td>{formatDate(penitipan.tanggal_akhir_penitipan)}</td>
              <td>{penitipan.nama_petugas_qc || '-'}</td>
              <td>
                {penitipan.pegawai ? 
                  `${penitipan.pegawai.nama_pegawai} (ID: ${penitipan.pegawai.id_pegawai})` : 
                  '-'
                }
              </td>
              <td>{penitipan.barang?.length || 0}</td>
              <td>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={() => onPrintNota(penitipan.id_penitipan)}
                    title="Cetak Nota"
                  >
                    <FaPrint />
                  </button>
                  <button 
                    className="btn btn-sm btn-info text-white" 
                    onClick={() => onViewDetail(penitipan.id_penitipan)}
                    title="Lihat Detail"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="btn btn-sm btn-warning text-white" 
                    onClick={() => onEditPenitipan(penitipan.id_penitipan)}
                    title="Edit Penitipan"
                  >
                    <FaEdit />
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

export default RiwayatPenitipanTable;