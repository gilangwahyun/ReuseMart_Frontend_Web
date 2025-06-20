import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spinner } from "react-bootstrap";
import { getSalesReportByCategory } from "../../api/BarangApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LaporanPenjualanKategori = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getSalesReportByCategory();
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sales report by category:", err);
      setError("Gagal mengambil data laporan penjualan per kategori");
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

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const tanggalCetak = new Date();
    
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
    doc.text(`LAPORAN PENJUALAN PER KATEGORI BARANG`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Info laporan
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tahun: ${getCurrentYear()}`, 15, 45);
    doc.text(`Tanggal cetak: ${formatDate()}`, doc.internal.pageSize.width - 15, 45, { align: 'right' });
    
    // Tabel data
    autoTable(doc, {
      head: [["No", "Kategori", "Jumlah Item Terjual", "Jumlah Item Gagal Terjual", "Persentase Terjual (%)"]],
      body: reportData.map((item, index) => [
        index + 1,
        item.nama_kategori,
        item.barang_terjual,
        item.barang_tidak_terjual,
        `${item.persentase_terjual}%`
      ]),
      startY: 55,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [40, 167, 69] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text(`© ${new Date().getFullYear()} ReUse Mart`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Format nama file: ReUseMart_Laporan_[Jenis]_[Tahun]_[TanggalCetak]
    const tanggalCetakStr = new Date().toISOString().split('T')[0];
    doc.save(`ReUseMart_Laporan_Penjualan_Kategori_${getCurrentYear()}_${tanggalCetakStr}.pdf`);
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
                      {!loading && !error && reportData.length > 0 && (
                        <Button 
                          variant="success" 
                          onClick={handlePrintPDF}
                        >
                          <i className="fas fa-file-pdf me-2"></i> Unduh PDF
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-center fw-bold mt-4 mb-3">LAPORAN PENJUALAN PER KATEGORI BARANG</h2>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Tahun:</strong> {getCurrentYear()}</p>
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
                ) : reportData.length > 0 ? (
                  <div className="table-responsive">
                    <Table bordered className="mt-3">
                      <thead className="bg-success text-white">
                        <tr>
                          <th className="text-center">No</th>
                          <th>Kategori</th>
                          <th className="text-center">Jumlah Item Terjual</th>
                          <th className="text-center">Jumlah Item Gagal Terjual</th>
                          <th className="text-center">Persentase Terjual (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item, index) => (
                          <tr key={item.id_kategori}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-start">{item.nama_kategori}</td>
                            <td className="text-center">{item.barang_terjual}</td>
                            <td className="text-center">{item.barang_tidak_terjual}</td>
                            <td className="text-center">{item.persentase_terjual}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center">Tidak ada data laporan penjualan yang tersedia.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LaporanPenjualanKategori; 