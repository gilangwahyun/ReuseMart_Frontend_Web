import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spinner } from "react-bootstrap";
import { getExpiredConsignmentsReport } from "../../api/PenitipanBarangApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LaporanPenitipanHabis = () => {
  const [expiredReportData, setExpiredReportData] = useState([]);
  const [flattenedExpiredData, setFlattenedExpiredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getExpiredConsignmentsReport();
      console.log("Expired consignments data:", response.data);
      setExpiredReportData(response.data);
      
      // Flatten the data for tabular display
      const flattenedData = [];
      if (Array.isArray(response.data)) {
        response.data.forEach(item => {
          if (item.barang && item.barang.length > 0) {
            item.barang.forEach(barang => {
              flattenedData.push({
                kode_produk: barang.id_barang,
                nama_produk: barang.nama_barang,
                id_penitip: item.id_penitip,
                nama_penitip: item.nama_penitip,
                tanggal_masuk: item.tanggal_awal_penitipan,
                tanggal_akhir: item.tanggal_akhir_penitipan,
                batas_ambil: item.batas_akhir_penitipan,
                status_barang: barang.status_barang
              });
            });
          }
        });
      }
      
      setFlattenedExpiredData(flattenedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching expired consignments report:", err);
      setError("Gagal mengambil data laporan penitipan yang habis masa.");
    } finally {
      setLoading(false);
    }
  };

  // Format current date
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ReUse Mart", 15, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 15, 22);
    
    // Judul laporan
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN BARANG YANG MASA PENITIPANNYA SUDAH HABIS", doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Info laporan
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal cetak: ${formatDate()}`, 15, 45);
    
    // Tabel data
    autoTable(doc, {
      head: [["No", "Kode Produk", "Nama Produk", "ID Penitip", "Nama Penitip", "Tanggal Masuk", "Tanggal Akhir", "Batas Ambil", "Status"]],
      body: flattenedExpiredData.map((item, index) => [
        index + 1,
        item.kode_produk,
        item.nama_produk,
        item.id_penitip,
        item.nama_penitip,
        formatDisplayDate(item.tanggal_masuk),
        formatDisplayDate(item.tanggal_akhir),
        formatDisplayDate(item.batas_ambil),
        item.status_barang
      ]),
      startY: 55,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 167, 69] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 10 }, // No
        1: { cellWidth: 20 }, // Kode Produk
        2: { cellWidth: 40 }, // Nama Produk
        3: { cellWidth: 15 }, // ID Penitip
        4: { cellWidth: 30 }, // Nama Penitip
        5: { cellWidth: 30 }, // Tanggal Masuk
        6: { cellWidth: 30 }, // Tanggal Akhir
        7: { cellWidth: 30 }, // Batas Ambil
        8: { cellWidth: 20 }, // Status
      }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text(`© ${new Date().getFullYear()} ReUse Mart`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Format nama file: ReUseMart_Laporan_[Jenis]_[TanggalCetak]
    const tanggalCetakStr = new Date().toISOString().split('T')[0];
    doc.save(`ReUseMart_Laporan_Penitipan_Habis_${tanggalCetakStr}.pdf`);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <Card className="shadow-sm">
            <Card.Body>
              {/* Header */}
              <div className="d-flex flex-column">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="fw-bold mb-0">ReUse Mart</h4>
                      <p className="text-muted mb-0">Jl. Green Eco Park No. 456 Yogyakarta</p>
                    </div>
                    <div className="text-end">
                      {!loading && !error && flattenedExpiredData.length > 0 && (
                        <Button 
                          variant="success" 
                          onClick={handlePrintPDF}
                        >
                          <i className="fas fa-file-pdf me-2"></i> Unduh PDF
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-center fw-bold mt-4 mb-3">LAPORAN BARANG YANG MASA PENITIPANNYA SUDAH HABIS</h2>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Tanggal Cetak:</strong> {formatDate()}</p>
                    </div>
                  </div>
                </div>

                {/* Konten Laporan */}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-2">Memuat data...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : flattenedExpiredData.length > 0 ? (
                  <div className="table-responsive">
                    <Table bordered className="mt-3">
                      <thead className="bg-success text-white">
                        <tr>
                          <th className="text-center">No</th>
                          <th>Kode Produk</th>
                          <th>Nama Produk</th>
                          <th>ID Penitip</th>
                          <th>Nama Penitip</th>
                          <th>Tanggal Masuk</th>
                          <th>Tanggal Akhir</th>
                          <th>Batas Ambil</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flattenedExpiredData.map((item, index) => (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{item.kode_produk}</td>
                            <td className="text-start">{item.nama_produk}</td>
                            <td>{item.id_penitip}</td>
                            <td className="text-start">{item.nama_penitip}</td>
                            <td>{formatDisplayDate(item.tanggal_masuk)}</td>
                            <td>{formatDisplayDate(item.tanggal_akhir)}</td>
                            <td>{formatDisplayDate(item.batas_ambil)}</td>
                            <td>{item.status_barang}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center">Tidak ada data barang dengan masa penitipan habis.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LaporanPenitipanHabis; 