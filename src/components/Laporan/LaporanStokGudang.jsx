import React, { useState, useEffect } from "react";
import { getLaporanStokGudang } from "../../api/BarangApi";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Style untuk PDF
const stylesPdf = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 11, padding: 20 },
  header: { 
    marginBottom: 20,
  },
  headerLeft: {
    textAlign: "left",
    marginBottom: 5,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "Helvetica-Bold",
  },
  title: { 
    fontSize: 18, 
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  infoRow: {
    marginTop: 5,
    marginBottom: 5,
  },
  table: { 
    display: "table", 
    width: "100%", 
    borderStyle: "solid", 
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
    marginTop: 10,
  },
  tableRow: { 
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
    fontFamily: "Helvetica-Bold",
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  summarySection: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 11,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
  }
});

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

// Komponen PDF untuk Laporan Stok Gudang
const LaporanStokGudangDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={stylesPdf.page} orientation="landscape">
      {/* Header */}
      <View style={stylesPdf.header}>
        <View style={stylesPdf.headerLeft}>
          <Text style={stylesPdf.companyName}>ReUse Mart</Text>
          <Text>Jl. Green Eco Park No. 456 Yogyakarta</Text>
        </View>
        
        <Text style={stylesPdf.title}>Laporan Stok Gudang</Text>
        
        <View style={stylesPdf.infoRow}>
          <Text>Tanggal Cetak: {formatDateTimeLong(data.tanggal_cetak)}</Text>
          <Text>Total Barang: {data.total_barang}</Text>
        </View>
      </View>
      
      {/* Tabel */}
      <View style={stylesPdf.table}>
        {/* Header Tabel */}
        <View style={[stylesPdf.tableRow, stylesPdf.tableHeader]}>
          <View style={[stylesPdf.tableCell, { width: "6%" }]}>
            <Text>ID Barang</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "15%" }]}>
            <Text>Nama Barang</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "8%" }]}>
            <Text>Harga (Rp)</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "6%" }]}>
            <Text>Status</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "6%" }]}>
            <Text>ID Penitip</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "12%" }]}>
            <Text>Nama Penitip</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "12%" }]}>
            <Text>Tanggal Penitipan</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "6%" }]}>
            <Text>ID Hunter</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "12%" }]}>
            <Text>Nama Hunter</Text>
          </View>
          <View style={[stylesPdf.tableCell, { width: "8%", borderRightWidth: 0 }]}>
            <Text>Perpanjangan</Text>
          </View>
        </View>
        
        {/* Baris Data */}
        {data.data.map((item, index) => (
          <View key={index} style={stylesPdf.tableRow}>
            <View style={[stylesPdf.tableCell, { width: "6%" }]}>
              <Text>{item.id_barang}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "15%" }]}>
              <Text>{item.nama_barang}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "8%" }]}>
              <Text>{Number(item.harga).toLocaleString()}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "6%" }]}>
              <Text>{item.status_barang}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "6%" }]}>
              <Text>{item.penitip ? item.penitip.id_penitip : "-"}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "12%" }]}>
              <Text>{item.penitip ? item.penitip.nama_penitip : "-"}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "12%" }]}>
              <Text>
                {item.penitipan ? item.penitipan.tanggal_awal_penitipan : "-"}
              </Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "6%" }]}>
              <Text>{item.hunter ? item.hunter.id_pegawai : "-"}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "12%" }]}>
              <Text>{item.hunter ? item.hunter.nama_pegawai : "-"}</Text>
            </View>
            <View style={[stylesPdf.tableCell, { width: "8%", borderRightWidth: 0 }]}>
              <Text>{item.ada_perpanjangan}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={stylesPdf.footer}>
        <Text>© {new Date().getFullYear()} ReUse Mart - Laporan ini dicetak pada {formatDateTimeLong(data.tanggal_cetak)}</Text>
      </View>
    </Page>
  </Document>
);

// Komponen Utama
const LaporanStokGudang = () => {
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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
                        <PDFDownloadLink
                          document={<LaporanStokGudangDocument data={laporanData} />}
                          fileName={`LaporanStokGudang_${new Date().toISOString().slice(0,10)}.pdf`}
                          className="btn btn-success ms-2"
                        >
                          {({ loading }) =>
                            loading ? "Menyiapkan PDF..." : "Unduh PDF"
                          }
                        </PDFDownloadLink>
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