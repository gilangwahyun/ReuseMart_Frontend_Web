import React, { useEffect, useState } from "react";
import { Card, Form, Table, Button, Row, Col, Spinner } from "react-bootstrap";
import { getLaporanKomisi } from "../../api/TransaksiApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

// Fungsi untuk memformat tanggal
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
};

// Fungsi untuk memformat angka ke format rupiah
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

const LaporanKomisiBulanan = () => {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState("");
  const [tahunOptions] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  });

  useEffect(() => {
    fetchData(tahun, bulan);
  }, [tahun, bulan]);

  const fetchData = async (year, month = null) => {
    setLoading(true);
    try {
      const response = await getLaporanKomisi(year, month);
      setLaporan(response);
      console.log(response);
      setError(null);
    } catch (err) {
      console.error("Error fetching laporan komisi:", err);
      setError("Gagal memuat data laporan komisi");
    } finally {
      setLoading(false);
    }
  };

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
    const judulLaporan = `Laporan Komisi ${bulan ? `Bulan ${new Date(2000, bulan-1).toLocaleDateString('id-ID', {month: 'long'})}` : ''} ${tahun}`;
    doc.text(judulLaporan, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Info laporan
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${formatDateTimeLong(tanggalCetak)}`, 15, 45);

    // Tabel data
    const tableColumn = [
      "No", "ID Transaksi", "ID Barang", "Nama Barang", "Harga Jual", 
      "Tanggal Masuk", "Tanggal Laku", "Komisi Hunter", 
      "Komisi ReUse Mart", "Bonus Penitip"
    ];
    
    const tableRows = laporan.data.map((item, index) => [
      index + 1,
      item.id_transaksi,
      item.id_barang,
      item.nama_barang,
      formatRupiah(item.harga_jual),
      formatDate(item.tanggal_awal_penitipan),
      formatDate(item.tanggal_transaksi),
      formatRupiah(item.komisi_hunter),
      formatRupiah(item.komisi_reuse_mart),
      formatRupiah(item.bonus_penitip)
    ]);

    // Tambahkan baris total
    tableRows.push([
      "", "", "", "TOTAL", "", "", "",
      formatRupiah(laporan.total.total_komisi_hunter),
      formatRupiah(laporan.total.total_komisi_reuse_mart),
      formatRupiah(laporan.total.total_bonus_penitip)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 167, 69] },
      footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    // Footer
    doc.setFontSize(10);
    doc.text(`© ${new Date().getFullYear()} ReUse Mart`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Format nama file: ReUseMart_Laporan_[Jenis]_[Bulan]_[Tahun]_[TanggalCetak]
    const namaBulan = bulan ? new Date(2000, bulan-1).toLocaleDateString('id-ID', {month: 'long'}) : 'Semua';
    const tanggalCetakStr = new Date().toISOString().split('T')[0];
    doc.save(`ReUseMart_Laporan_Komisi_${namaBulan}_${tahun}_${tanggalCetakStr}.pdf`);
  };

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
                      {!loading && !error && laporan && (
                        <Button 
                          variant="success" 
                          onClick={handlePrintPDF}
                        >
                          <i className="fas fa-file-pdf me-2"></i> Unduh PDF
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-center fw-bold mt-4 mb-3">Laporan Komisi Bulanan</h2>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Periode:</strong> {bulan ? new Date(2000, bulan-1).toLocaleDateString('id-ID', {month: 'long'}) : 'Semua Bulan'} {tahun}
                      </p>
                      <p className="mb-1">
                        <strong>Tanggal Cetak:</strong> {formatDateTimeLong(new Date())}
                      </p>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>Tahun</Form.Label>
                        <Form.Control 
                          as="select" 
                          value={tahun}
                          onChange={(e) => setTahun(e.target.value)}
                          className="mb-3"
                        >
                          {tahunOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>Bulan</Form.Label>
                        <Form.Control 
                          as="select" 
                          value={bulan}
                          onChange={(e) => setBulan(e.target.value)}
                          className="mb-3"
                        >
                          <option value="">Semua Bulan</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1).toLocaleDateString('id-ID', { month: 'long' })}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
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
                ) : laporan && laporan.data.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="bg-success text-white">
                          <tr>
                            <th className="text-center">No</th>
                            <th>ID Transaksi</th>
                            <th>ID Barang</th>
                            <th>Nama Barang</th>
                            <th className="text-end">Harga Jual</th>
                            <th className="text-center">Tanggal Masuk</th>
                            <th className="text-center">Tanggal Laku</th>
                            <th className="text-end">Komisi Hunter</th>
                            <th className="text-end">Komisi ReUse Mart</th>
                            <th className="text-end">Bonus Penitip</th>
                          </tr>
                        </thead>
                        <tbody>
                          {laporan.data.map((item, index) => (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.id_transaksi}</td>
                              <td>{item.id_barang}</td>
                              <td>{item.nama_barang}</td>
                              <td className="text-end">{formatRupiah(item.harga_jual)}</td>
                              <td className="text-center">{formatDate(item.tanggal_awal_penitipan)}</td>
                              <td className="text-center">{formatDate(item.tanggal_transaksi)}</td>
                              <td className="text-end">{formatRupiah(item.komisi_hunter)}</td>
                              <td className="text-end">{formatRupiah(item.komisi_reuse_mart)}</td>
                              <td className="text-end">{formatRupiah(item.bonus_penitip)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold">
                          <tr>
                            <td colSpan="7" className="text-end">TOTAL</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_komisi_hunter)}</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_komisi_reuse_mart)}</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_bonus_penitip)}</td>
                          </tr>
                          <tr>
                            <td colSpan="7" className="text-end">TOTAL KESELURUHAN</td>
                            <td colSpan="3" className="text-end">{formatRupiah(laporan.total.total_keseluruhan)}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-info">Tidak ada data yang tersedia.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanKomisiBulanan; 