import React, { useEffect, useState } from "react";
import OwnerSidebar from "../../components/OwnerSideBar";
import { getPegawaiByUserId } from "../../api/PegawaiApi";
import { getSalesReportByCategory } from "../../api/BarangApi";
import { getExpiredConsignmentsReport } from "../../api/PenitipanBarangApi";
import { Card, Button, Table, Tabs, Tab } from "react-bootstrap";

const OwnerDashboard = () => {
  const [namaPegawai, setNamaPegawai] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  
  // States for expired consignments report
  const [showExpiredReport, setShowExpiredReport] = useState(false);
  const [expiredReportData, setExpiredReportData] = useState([]);
  const [flattenedExpiredData, setFlattenedExpiredData] = useState([]);
  const [expiredReportLoading, setExpiredReportLoading] = useState(false);
  const [expiredReportError, setExpiredReportError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      setError("Pengguna belum login.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      const idUser = user.id_user;

      const fetchPegawai = async () => {
        try {
          const response = await getPegawaiByUserId(idUser);
          const data = response;
          console.log(response);

          if (data && data.nama_pegawai) {
            setNamaPegawai(data.nama_pegawai);
          } else {
            setError("Data pegawai tidak ditemukan.");
          }
        } catch (err) {
          console.error(err);
          setError("Gagal mengambil data pegawai.");
        } finally {
          setLoading(false);
        }
      };

      fetchPegawai();
    } catch (err) {
      console.error("Error parsing user data:", err);
      setError("Data pengguna tidak valid.");
      setLoading(false);
    }
  }, []);

  const handleShowReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const response = await getSalesReportByCategory();
      setReportData(response.data);
      setShowReport(true);
      setShowExpiredReport(false);
    } catch (err) {
      console.error("Error fetching sales report:", err);
      setReportError("Gagal mengambil data laporan penjualan.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleShowExpiredReport = async () => {
    setExpiredReportLoading(true);
    setExpiredReportError(null);
    try {
      const response = await getExpiredConsignmentsReport();
      console.log("Expired consignments data:", response.data); // Log for debugging
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
                batas_ambil: item.batas_akhir_penitipan
              });
            });
          }
        });
      }
      
      console.log("Flattened data:", flattenedData); // Log for debugging
      setFlattenedExpiredData(flattenedData);
      setShowExpiredReport(true);
      setShowReport(false);
    } catch (err) {
      console.error("Error fetching expired consignments report:", err);
      setExpiredReportError("Gagal mengambil data laporan penitipan yang habis masa.");
    } finally {
      setExpiredReportLoading(false);
    }
  };

  // Format current date
  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const printReport = () => {
    const printContent = document.getElementById('reportToPrint');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const printExpiredReport = () => {
    const printContent = document.getElementById('expiredReportToPrint');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="d-flex">
      <OwnerSidebar />
      <div className="p-4 w-100">
        {loading ? (
          <p>Memuat data pegawai...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div>
            <h3>Selamat datang, {namaPegawai}!</h3>
            <p>Silakan pilih menu di sidebar untuk melanjutkan.</p>
            
            <div className="mt-4 d-flex gap-2">
              <Button 
                variant="primary" 
                onClick={handleShowReport}
                disabled={reportLoading}
              >
                {reportLoading ? "Memuat..." : "Laporan Penjualan Barang per Kategori"}
              </Button>
              
              <Button 
                variant="info" 
                onClick={handleShowExpiredReport}
                disabled={expiredReportLoading}
              >
                {expiredReportLoading ? "Memuat..." : "Laporan Penitipan Barang yang Habis Masa Titip"}
              </Button>
            </div>
            
            {/* Print buttons */}
            <div className="mt-2">
              {showReport && !reportLoading && reportData.length > 0 && (
                <Button 
                  variant="success" 
                  onClick={printReport}
                  className="me-2"
                >
                  Cetak Laporan Penjualan per Kategori
                </Button>
              )}
              
              {showExpiredReport && !expiredReportLoading && flattenedExpiredData.length > 0 && (
                <Button 
                  variant="success" 
                  onClick={printExpiredReport}
                >
                  Cetak Laporan Penitipan Barang yang Habis Masa Titip
                </Button>
              )}
            </div>
            
            {/* Error messages */}
            {reportError && (
              <p className="text-danger mt-2">{reportError}</p>
            )}
            
            {expiredReportError && (
              <p className="text-danger mt-2">{expiredReportError}</p>
            )}
            
            {/* Sales Report by Category */}
            {showReport && !reportLoading && reportData.length > 0 && (
              <div id="reportToPrint" className="mt-3">
                <div className="text-center border p-3">
                  <h3 className="mb-0">ReUse Mart</h3>
                  <p className="mb-3">Jl. Green Eco Park No. 456 Yogyakarta</p>
                  
                  <h5 className="text-uppercase font-weight-bold mt-4 mb-3">LAPORAN PENJUALAN PER KATEGORI BARANG</h5>
                  <div className="d-flex justify-content-between mb-3">
                    <p className="mb-0"><strong>Tahun:</strong> {getCurrentYear()}</p>
                    <p className="mb-0"><strong>Tanggal cetak:</strong> {formatDate()}</p>
                  </div>
                  
                  <Table bordered className="mt-3">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: '50%' }}>Kategori</th>
                        <th style={{ width: '25%' }}>Jumlah item terjual</th>
                        <th style={{ width: '25%' }}>Jumlah item gagal terjual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((item) => (
                        <tr key={item.id_kategori}>
                          <td className="text-start">{item.nama_kategori}</td>
                          <td>{item.barang_terjual}</td>
                          <td>{item.barang_tidak_terjual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
            
            {/* Empty sales report message */}
            {showReport && !reportLoading && reportData.length === 0 && (
              <p className="mt-3">Tidak ada data laporan penjualan yang tersedia.</p>
            )}
            
            {/* Expired Consignments Report */}
            {showExpiredReport && !expiredReportLoading && (
              <div id="expiredReportToPrint" className="mt-3">
                <div className="text-center border p-3">
                  <h3 className="mb-0">ReUse Mart</h3>
                  <p className="mb-3">Jl. Green Eco Park No. 456 Yogyakarta</p>
                  
                  <h5 className="text-uppercase font-weight-bold mt-4 mb-3">LAPORAN Barang yang Masa Penitipannya Sudah Habis</h5>
                  <p className="mb-3 text-start"><strong>Tanggal cetak:</strong> {formatDate()}</p>
                  
                  {flattenedExpiredData.length > 0 ? (
                    <Table bordered className="mt-3">
                      <thead className="bg-light">
                        <tr>
                          <th>Kode Produk</th>
                          <th>Nama Produk</th>
                          <th>Id Penitip</th>
                          <th>Nama Penitip</th>
                          <th>Tanggal Masuk</th>
                          <th>Tanggal Akhir</th>
                          <th>Batas Ambil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flattenedExpiredData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.kode_produk}</td>
                            <td className="text-start">{item.nama_produk}</td>
                            <td>{item.id_penitip}</td>
                            <td className="text-start">{item.nama_penitip}</td>
                            <td>{formatDisplayDate(item.tanggal_masuk)}</td>
                            <td>{formatDisplayDate(item.tanggal_akhir)}</td>
                            <td>{formatDisplayDate(item.batas_ambil)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>Tidak ada data barang dengan masa penitipan habis.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Empty expired consignments report message - no longer needed since we handle it in the report itself */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;