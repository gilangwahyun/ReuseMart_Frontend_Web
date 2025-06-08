import React, { useEffect, useState, useRef } from "react";
import { Card, Form, Table, Button, Row, Col, Spinner } from "react-bootstrap";
import { getLaporanPenjualanBulanan } from "../../api/TransaksiApi";
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

const LaporanPenjualan = () => {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());
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
    
    fetchData(tahun);
  }, []);

  const fetchData = async (year) => {
    setLoading(true);
    try {
      const data = await getLaporanPenjualanBulanan(year);
      setLaporan(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching laporan penjualan:", err);
      setError("Gagal memuat data laporan penjualan");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTahun = (e) => {
    const selectedYear = e.target.value;
    setTahun(selectedYear);
    fetchData(selectedYear);
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
      id: "penjualan-bulanan",
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
          customIcons: []
        },
        export: {
          csv: {
            filename: `Laporan_Penjualan_${tahun}`,
            columnDelimiter: ',',
            headerCategory: 'Bulan',
            headerValue: 'Nilai',
          },
          svg: {
            filename: `Grafik_Penjualan_${tahun}`,
          },
          png: {
            filename: `Grafik_Penjualan_${tahun}`,
          },
        },
      }
    },
    title: {
      text: `Grafik Penjualan Bulanan Tahun ${tahun}`,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return formatRupiah(val).replace('Rp', '');
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: laporan?.data.map(item => item.nama_bulan) || []
    },
    yaxis: {
      title: {
        text: 'Total Penjualan (Rp)'
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
    colors: ['#28a745']
  };

  const chartSeries = [
    {
      name: 'Total Penjualan',
      data: laporan?.data.map(item => item.total_penjualan) || []
    }
  ];

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
    doc.text(`Laporan Penjualan Bulanan Tahun ${tahun}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
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
    doc.text(`Total Barang Terjual: ${laporan.total.total_barang_terjual}`, 15, 52);
    doc.text(`Total Transaksi: ${laporan.total.total_transaksi}`, 15, 59);
    doc.text(`Total Penjualan Kotor: ${formatRupiah(laporan.total.total_penjualan)}`, 15, 66);
    
    // Tabel data
    autoTable(doc, {
      head: [["No", "Bulan", "Jumlah Barang Terjual", "Jumlah Transaksi", "Total Penjualan Kotor"]],
      body: laporan.data.map((item, index) => [
        index + 1,
        item.nama_bulan,
        item.jumlah_barang_terjual.toString(),
        item.jumlah_transaksi.toString(),
        formatRupiah(item.total_penjualan)
      ]),
      foot: [[
        "",
        "TOTAL",
        laporan.total.total_barang_terjual.toString(),
        laporan.total.total_transaksi.toString(),
        formatRupiah(laporan.total.total_penjualan)
      ]],
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
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
    doc.text(`Grafik Penjualan Bulanan Tahun ${tahun}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Tambahkan grafik
    html2canvas(chartRef.current).then((canvas) => {
      const chartImage = canvas.toDataURL('image/png');
      const imgWidth = doc.internal.pageSize.width - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(chartImage, 'PNG', 15, 45, imgWidth, imgHeight);
      
      // Footer halaman 2
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`© ${new Date().getFullYear()} ReUse Mart - Halaman 2 dari 2`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      
      // Format nama file: ReUseMart_Laporan_[Jenis]_[Bulan]_[Tahun]_[TanggalCetak]
      const tanggalCetakStr = new Date().toISOString().split('T')[0];
      doc.save(`ReUseMart_Laporan_Penjualan_${tahun}_${tanggalCetakStr}.pdf`);
    });
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
                  
                  <h2 className="text-center fw-bold mt-4 mb-3">Laporan Penjualan Bulanan</h2>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Tahun:</strong> {tahun}</p>
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
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Barang Terjual</h5>
                            <h2 className="card-text text-success">{laporan.total.total_barang_terjual}</h2>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Transaksi</h5>
                            <h2 className="card-text text-success">{laporan.total.total_transaksi}</h2>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Penjualan Kotor</h5>
                            <h2 className="card-text text-success">{formatRupiah(laporan.total.total_penjualan)}</h2>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive" ref={tableRef}>
                      <Table striped bordered hover>
                        <thead className="bg-success text-white">
                          <tr>
                            <th className="text-center">No</th>
                            <th>Bulan</th>
                            <th className="text-center">Jumlah Barang Terjual</th>
                            <th className="text-center">Jumlah Transaksi</th>
                            <th className="text-center">Total Penjualan Kotor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {laporan.data.map((item, index) => (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.nama_bulan}</td>
                              <td className="text-center">{item.jumlah_barang_terjual}</td>
                              <td className="text-center">{item.jumlah_transaksi}</td>
                              <td className="text-end">{formatRupiah(item.total_penjualan)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-light fw-bold">
                          <tr>
                            <td colSpan="2" className="text-end">TOTAL</td>
                            <td className="text-center">{laporan.total.total_barang_terjual}</td>
                            <td className="text-center">{laporan.total.total_transaksi}</td>
                            <td className="text-end">{formatRupiah(laporan.total.total_penjualan)}</td>
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
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPenjualan; 