import React, { useState, useEffect } from "react";
import { getLaporanStokGudang } from "../../api/BarangApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Fungsi untuk memformat tanggal dan waktu lokal Indonesia

// Fungsi untuk memformat tanggal dan waktu lokal Indonesia
const formatDateTimeLong = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Komponen Utama
const LaporanStokGudang = () => {
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handlePrintPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const tanggalCetak = new Date();
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ReUse Mart", 15, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 15, 22);
    
    // Judul laporan
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Stok Gudang", doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Info laporan
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${formatDateTimeLong(tanggalCetak)}`, 15, 45);
    doc.text(`Total Barang: ${laporanData.total_barang}`, 15, 52);
    
    // Tabel data
    const tableColumn = [
      "No", "ID Barang", "Nama Barang", "Harga", "Status",
      "ID Penitip", "Nama Penitip", "Tanggal Penitipan",
      "ID Hunter", "Nama Hunter", "Perpanjangan"
    ];
    
    const tableRows = laporanData.data.map((item, index) => [
      index + 1,
      item.id_barang,
      item.nama_barang,
      `Rp ${Number(item.harga).toLocaleString()}`,
      item.status_barang,
      item.penitip ? item.penitip.id_penitip : "-",
      item.penitip ? item.penitip.nama_penitip : "-",
      item.penitipan ? formatDateTimeLong(item.penitipan.tanggal_awal_penitipan) : "-",
      item.hunter ? item.hunter.id_pegawai : "-",
      item.hunter ? item.hunter.nama_pegawai : "-",
      item.ada_perpanjangan
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 167, 69] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    // Footer
    doc.setFontSize(10);
    doc.text(`© ${new Date().getFullYear()} ReUse Mart`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Format nama file: ReUseMart_Laporan_[Jenis]_[TanggalCetak]
    const tanggalCetakStr = new Date().toISOString().split('T')[0];
    doc.save(`ReUseMart_Laporan_StokGudang_${tanggalCetakStr}.pdf`);
  };

  // Mengambil data laporan
  const fetchLaporanData = async () => {
    setIsSearching(true);
    try {
      const data = await getLaporanStokGudang();
      setLaporanData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching laporan:", err);
      setError("Gagal mengambil data laporan stok gudang.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // Ambil data awal saat komponen dimuat
  useEffect(() => {
    fetchLaporanData();
  }, []);

  // Format tanggal dan waktu lokal untuk tampilan web
  const formatDateTimeLong = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Header */}
              <div className="d-flex flex-column">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="fw-bold mb-0">ReUse Mart</h4>
                      <p className="text-muted mb-0">Jl. Green Eco Park No. 456 Yogyakarta</p>
                    </div>
                    <div className="text-end">
                      {laporanData && (
                        <button 
                          className="btn btn-success"
                          onClick={handlePrintPDF}
                        >
                          <i className="fas fa-file-pdf me-2"></i> Unduh PDF
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-center fw-bold mt-4 mb-3">Laporan Stok Gudang</h2>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Tanggal Cetak:</strong> {laporanData ? formatDateTimeLong(laporanData.tanggal_cetak) : "-"}</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <p className="mb-1"><strong>Total Barang:</strong> {laporanData?.total_barang || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Tabel Laporan */}
                <div className="table-responsive mt-2">
                  <table className="table table-striped table-bordered table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>ID Barang</th>
                        <th>Nama Barang</th>
                        <th>Harga</th>
                        <th>Status</th>
                        <th>ID Penitip</th>
                        <th>Nama Penitip</th>
                        <th>Tanggal Penitipan</th>
                        <th>ID Hunter</th>
                        <th>Nama Hunter</th>
                        <th>Perpanjangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporanData?.data.length > 0 ? (
                        laporanData.data.map((item, index) => (
                          <tr key={index}>
                            <td>{item.id_barang}</td>
                            <td>{item.nama_barang}</td>
                            <td>Rp {Number(item.harga).toLocaleString()}</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  item.status_barang === "aktif"
                                    ? "success"
                                    : "secondary"
                                }`}
                              >
                                {item.status_barang}
                              </span>
                            </td>
                            <td>{item.penitip ? item.penitip.id_penitip : "-"}</td>
                            <td>{item.penitip ? item.penitip.nama_penitip : "-"}</td>
                            <td>
                              {item.penitipan
                                ? formatDateTimeLong(item.penitipan.tanggal_awal_penitipan)
                                : "-"}
                            </td>
                            <td>{item.hunter ? item.hunter.id_pegawai : "-"}</td>
                            <td>{item.hunter ? item.hunter.nama_pegawai : "-"}</td>
                            <td>{item.ada_perpanjangan}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center">
                            Tidak ada data barang
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanStokGudang; 