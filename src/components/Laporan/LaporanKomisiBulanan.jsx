import React, { useEffect, useState, useRef } from "react";
import { Card, Form, Table, Button, Row, Col, Spinner } from "react-bootstrap";
import { getLaporanKomisiBulanan } from "../../api/KomisiPerusahaanApi";
import Chart from "react-apexcharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

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

const LaporanKomisiBulanan = () => {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState("");
  const [tahunOptions, setTahunOptions] = useState([]);
  
  const chartRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    // Membuat opsi tahun dari tahun 2020 hingga tahun sekarang
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 2020; i <= currentYear; i++) {
      years.push(i);
    }
    setTahunOptions(years);
    
    fetchData(tahun, bulan);
  }, []);

  const fetchData = async (year, month = null) => {
    setLoading(true);
    try {
      const data = await getLaporanKomisiBulanan(year, month);
      setLaporan(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching laporan komisi:", err);
      setError("Gagal memuat data laporan komisi");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTahun = (e) => {
    const selectedYear = e.target.value;
    setTahun(selectedYear);
    fetchData(selectedYear, bulan);
  };

  const handleChangeBulan = (e) => {
    const selectedMonth = e.target.value;
    setBulan(selectedMonth);
    fetchData(tahun, selectedMonth || null);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Konfigurasi chart
  const chartOptions = {
    chart: {
      id: "komisi-bulanan",
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      }
    },
    title: {
      text: `Grafik Distribusi Komisi ${bulan ? laporan?.nama_bulan + " " : ""}${tahun}`,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Total Komisi'],
    },
    yaxis: {
      title: {
        text: 'Total Komisi (Rp)'
      },
      labels: {
        formatter: function(val) {
          return formatRupiah(val).replace('Rp', '');
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return formatRupiah(val);
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
    },
    colors: ['#28a745', '#007bff', '#ffc107']
  };

  const chartSeries = laporan ? [
    {
      name: 'Komisi Perusahaan',
      data: [laporan.total.total_komisi_perusahaan]
    },
    {
      name: 'Komisi Hunter',
      data: [laporan.total.total_komisi_pegawai]
    },
    {
      name: 'Komisi Penitip',
      data: [laporan.total.total_komisi_penitip]
    }
  ] : [];

  // Fungsi untuk mencetak PDF
  const handlePrintPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const tanggalCetak = new Date();
    
    // Halaman 1: Tabel data
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
    const judulLaporan = `Laporan Komisi ${bulan ? laporan.nama_bulan + " " : ""}${tahun}`;
    doc.text(judulLaporan, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Info laporan
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${tanggalCetak.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}`, 15, 45);
    doc.text(`Total Transaksi: ${laporan.total.total_transaksi}`, 15, 52);
    doc.text(`Barang Cepat Terjual (<7 hari): ${laporan.total.barang_cepat_terjual}`, 15, 59);
    doc.text(`Barang dengan Perpanjangan: ${laporan.total.barang_perpanjangan}`, 15, 66);
    
    // Tabel data
    autoTable(doc, {
      head: [["No", "Nama Barang", "Harga", "Tanggal Transaksi", "Lama Penitipan", "Komisi Perusahaan", "Komisi Hunter", "Komisi Penitip", "Penitip", "Hunter"]],
      body: laporan.data.map((item, index) => [
        index + 1,
        item.nama_barang,
        formatRupiah(item.harga),
        formatDateTimeLong(item.tanggal_transaksi),
        `${item.hari_penitipan} hari`,
        formatRupiah(item.komisi_perusahaan),
        item.komisi_pegawai ? formatRupiah(item.komisi_pegawai) : "-",
        item.komisi_penitip ? formatRupiah(item.komisi_penitip) : "-",
        item.nama_penitip || "-",
        item.nama_hunter || "-"
      ]),
      foot: [[
        "",
        "TOTAL",
        "",
        "",
        "",
        formatRupiah(laporan.total.total_komisi_perusahaan),
        formatRupiah(laporan.total.total_komisi_pegawai),
        formatRupiah(laporan.total.total_komisi_penitip),
        "",
        ""
      ]],
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [40, 167, 69] },
      footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Footer halaman 1
    doc.setFontSize(10);
    doc.text(`© ${new Date().getFullYear()} ReUse Mart - Halaman 1 dari 2`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Halaman 2: Grafik
    doc.addPage();
    
    // Header halaman 2
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ReUse Mart", 15, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 15, 22);
    
    // Judul grafik
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Grafik Distribusi Komisi ${bulan ? laporan.nama_bulan + " " : ""}${tahun}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Tambahkan grafik
    html2canvas(chartRef.current).then((canvas) => {
      const chartImage = canvas.toDataURL('image/png');
      const imgWidth = doc.internal.pageSize.width - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(chartImage, 'PNG', 15, 45, imgWidth, imgHeight);
      
      // Deskripsi grafik & aturan komisi
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Penjelasan Aturan Komisi:", 15, 45 + imgHeight + 10);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const beschrijving = [
        "1. Komisi ReUseMart standar: 20% dari harga barang",
        "2. Komisi Hunter: 5% dari harga barang (jika barang hasil hunting)",
        "3. Bonus Penitip: 10% dari komisi perusahaan (jika barang laku < 7 hari)",
        "4. Komisi ReUseMart untuk barang dengan perpanjangan: 30% dari harga barang"
      ];
      
      let yPos = 45 + imgHeight + 15;
      beschrijving.forEach(text => {
        doc.text(text, 15, yPos);
        yPos += 5;
      });
      
      // Footer halaman 2
      doc.setFontSize(10);
      doc.text(`© ${new Date().getFullYear()} ReUse Mart - Halaman 2 dari 2`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      
      // Simpan PDF
      doc.save(`Laporan_Komisi_${bulan ? laporan.nama_bulan + "_" : ""}${tahun}.pdf`);
    });
  };

  // Contoh perhitungan komisi
  const contohPerhitunganKomisi = () => {
    return (
      <div className="mt-4 p-3 bg-light rounded">
        <h5 className="fw-bold mb-3">Contoh Perhitungan Komisi:</h5>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-header bg-success text-white">
                Barang Laku &lt; 7 hari
              </div>
              <div className="card-body">
                <p><strong>Harga Barang:</strong> Rp 2.000.000</p>
                <p><strong>Komisi ReUseMart (20%):</strong> Rp 400.000</p>
                <p><strong>Komisi Hunter (5%):</strong> Rp 100.000</p>
                <p><strong>Bonus Penitip (10% dari komisi):</strong> Rp 40.000</p>
                <hr/>
                <p><strong>Sisa untuk ReUseMart:</strong> Rp 260.000</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-info text-white">
                Barang Laku &gt; 1 bulan (dengan perpanjangan)
              </div>
              <div className="card-body">
                <p><strong>Harga Barang:</strong> Rp 2.000.000</p>
                <p><strong>Komisi ReUseMart (30%):</strong> Rp 600.000</p>
                <p><strong>Komisi Hunter:</strong> Rp 0 (bukan hasil hunting)</p>
                <p><strong>Bonus Penitip:</strong> Rp 0 (tidak ada bonus)</p>
                <hr/>
                <p><strong>Sisa untuk ReUseMart:</strong> Rp 600.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                  
                  <h2 className="text-center fw-bold mt-4 mb-3">Laporan Komisi Bulanan Per Produk</h2>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Periode:</strong> {bulan ? laporan?.nama_bulan + " " : ""}{tahun}</p>
                      <p className="mb-1"><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}</p>
                    </div>
                    <div className="col-md-3">
                      <Form.Group>
                        <Form.Label>Pilih Tahun</Form.Label>
                        <Form.Control 
                          as="select" 
                          value={tahun}
                          onChange={handleChangeTahun}
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
                        <Form.Label>Pilih Bulan</Form.Label>
                        <Form.Control 
                          as="select" 
                          value={bulan}
                          onChange={handleChangeBulan}
                          className="mb-3"
                        >
                          <option value="">Semua Bulan</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' })}
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
                ) : laporan ? (
                  <>
                    {/* Info ringkasan */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Komisi Perusahaan</h5>
                            <h2 className="card-text text-success">{formatRupiah(laporan.total.total_komisi_perusahaan)}</h2>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Komisi Hunter</h5>
                            <h2 className="card-text text-primary">{formatRupiah(laporan.total.total_komisi_pegawai)}</h2>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Komisi Penitip</h5>
                            <h2 className="card-text text-warning">{formatRupiah(laporan.total.total_komisi_penitip)}</h2>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Barang Cepat Laku</h5>
                            <h2 className="card-text text-info">{laporan.total.barang_cepat_terjual}</h2>
                            <small className="text-muted">Laku &lt; 7 hari</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive" ref={tableRef}>
                      <Table striped bordered hover size="sm">
                        <thead className="bg-success text-white">
                          <tr>
                            <th className="text-center">No</th>
                            <th>Barang</th>
                            <th className="text-center">Harga</th>
                            <th className="text-center">Tanggal Transaksi</th>
                            <th className="text-center">Lama Penitipan</th>
                            <th className="text-center">Perpanjangan</th>
                            <th className="text-center">Komisi Perusahaan</th>
                            <th className="text-center">Komisi Hunter</th>
                            <th className="text-center">Komisi Penitip</th>
                            <th>Penitip</th>
                            <th>Hunter</th>
                          </tr>
                        </thead>
                        <tbody>
                          {laporan.data.map((item, index) => (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td>
                                <div>{item.nama_barang}</div>
                                <small className="text-muted">ID: {item.id_barang}</small>
                              </td>
                              <td className="text-end">{formatRupiah(item.harga)}</td>
                              <td>{formatDateTimeLong(item.tanggal_transaksi)}</td>
                              <td className="text-center">
                                <span className={`badge ${item.hari_penitipan < 7 ? 'bg-success' : 'bg-secondary'}`}>
                                  {item.hari_penitipan} hari
                                </span>
                              </td>
                              <td className="text-center">
                                <span className={`badge ${item.ada_perpanjangan === 'ya' ? 'bg-warning' : 'bg-light text-dark'}`}>
                                  {item.ada_perpanjangan === 'ya' ? 'Ya' : 'Tidak'}
                                </span>
                              </td>
                              <td className="text-end">{formatRupiah(item.komisi_perusahaan)}</td>
                              <td className="text-end">{item.komisi_pegawai ? formatRupiah(item.komisi_pegawai) : "-"}</td>
                              <td className="text-end">{item.komisi_penitip ? formatRupiah(item.komisi_penitip) : "-"}</td>
                              <td>
                                {item.nama_penitip ? 
                                  <>
                                    <div>{item.nama_penitip}</div>
                                    <small className="text-muted">ID: {item.id_penitip}</small>
                                  </> : "-"
                                }
                              </td>
                              <td>
                                {item.nama_hunter ? 
                                  <>
                                    <div>{item.nama_hunter}</div>
                                    <small className="text-muted">ID: {item.id_pegawai}</small>
                                  </> : "-"
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold">
                          <tr>
                            <td colSpan="6" className="text-end">TOTAL</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_komisi_perusahaan)}</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_komisi_pegawai)}</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_komisi_penitip)}</td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                    
                    <div className="mt-5" ref={chartRef}>
                      <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height={350}
                      />
                    </div>

                    {contohPerhitunganKomisi()}
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