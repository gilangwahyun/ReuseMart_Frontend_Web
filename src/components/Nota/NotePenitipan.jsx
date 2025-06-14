import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getNotaPenitipanBarangById } from "../../api/NotaPenitipanBarangApi";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const stylesPdf = StyleSheet.create({
  page: { fontFamily: "Times-Roman", fontSize: 12, padding: 20 },
  header: { textAlign: "center", marginBottom: 10 },
  section: { marginBottom: 10 },
  bold: { fontWeight: "bold" },
  item: { marginBottom: 5 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#000", marginVertical: 10 },
});

const NotaPenitipanDocument = ({ nota }) => (
  <Document>
    <Page size="A4" style={stylesPdf.page}>
      <View style={stylesPdf.header}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>ReUse Mart</Text>
        <Text>Jl. Green Eco Park No. 456 Yogyakarta</Text>
      </View>

      <View style={stylesPdf.hr} />

      <View style={stylesPdf.section}>
        <Text>
          <Text style={stylesPdf.bold}>No Nota: </Text>
          {nota.nomor_nota}
        </Text>
        <Text>
          <Text style={stylesPdf.bold}>Tanggal Penitipan: </Text>
          {nota.tanggal_penitipan}
        </Text>
        <Text>
          <Text style={stylesPdf.bold}>Masa Penitipan Sampai: </Text>
          {nota.tanggal_akhir_penitipan}
        </Text>
      </View>

      <View style={stylesPdf.section}>
        <Text>
          <Text style={stylesPdf.bold}>Penitip: </Text>
          {nota.id_penitip} / {nota.nama_penitip}
        </Text>
        <Text>{nota.alamat_penitip}</Text>
      </View>

      <View style={stylesPdf.hr} />

      <View style={stylesPdf.section}>
        {nota.nota_detail_penitipan.map((detail, idx) => (
          <View key={idx} style={stylesPdf.item}>
            <Text>
              <Text style={stylesPdf.bold}>{detail.nama_barang}</Text> - Rp{" "}
              {detail.harga_barang.toLocaleString()}
            </Text>
            <Text>Status Garansi: {detail.status_garansi ? detail.status_garansi : "Tidak Ada Garansi"}</Text>
            <Text>Berat barang: {detail.berat_pengajuan} g</Text>
          </View>
        ))}
      </View>

      <View style={stylesPdf.hr} />

      <View style={stylesPdf.section}>
        <Text>
          <Text style={stylesPdf.bold}>Diterima dan QC oleh: </Text>
          {nota.nama_petugas_qc}
        </Text>
      </View>
    </Page>
  </Document>
);

const NotaPenitipanPrint = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id_nota_penitipan");
  const from = searchParams.get("from");
  const [nota, setNota] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNotaPenitipanBarangById(id);
        setNota(data);
      } catch (error) {
        console.error("Gagal mengambil data nota:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleNavigateBack = () => {
    // Tentukan halaman kembali berdasarkan parameter 'from'
    if (from === "riwayat-transaksi") {
      navigate("/pegawaiGudang/riwayat-transaksi");
    } else {
      navigate("/pegawaiGudang/penitipan");
    }
  };

  if (!nota) {
    return <p>Memuat data nota...</p>;
  }

  return (
    <div
      className="container py-4"
      style={{ maxWidth: "800px", margin: "auto", fontFamily: "serif" }}
    >
      {/* PREVIEW HTML */}
      <div style={{ border: "1px solid #ccc", padding: 20, marginBottom: 20 }}>
        <h2 style={{ textAlign: "center" }}>ReUse Mart</h2>
        <p style={{ textAlign: "center" }}>Jl. Green Eco Park No. 456 Yogyakarta</p>
        <hr />

        <p>
          <strong>No Nota:</strong> {nota.nomor_nota}
        </p>
        <p>
          <strong>Tanggal Penitipan:</strong> {nota.tanggal_penitipan}
        </p>
        <p>
          <strong>Masa Penitipan Sampai:</strong> {nota.tanggal_akhir_penitipan}
        </p>

        <p>
          <strong>Penitip:</strong> {nota.id_penitip} / {nota.nama_penitip}
        </p>
        <p>{nota.alamat_penitip}</p>

        <hr />

        {nota.nota_detail_penitipan.map((detail, idx) => (
          <div key={idx} style={{ marginBottom: 15 }}>
            <p>
              <strong>{detail.nama_barang}</strong> - Rp{" "}
              {detail.harga_barang.toLocaleString()}
            </p>
            <p>Status Garansi ON: {detail.status_garansi ? detail.status_garansi : "Tidak Ada Garansi"}</p>
            <p>Berat barang: {detail.berat_pengajuan} g</p>
          </div>
        ))}

        <hr />

        <p>
          <strong>Diterima dan QC oleh:</strong> {nota.nama_petugas_qc}
        </p>
      </div>

      {/* TOMBOL DOWNLOAD PDF dan KEMBALI SEJARAH */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 15,
        }}
      >
        <PDFDownloadLink
          document={<NotaPenitipanDocument nota={nota} />}
          fileName={`NotaPenitipan-${nota.nomor_nota || "ReUseMart"}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) =>
            loading ? (
              <button className="btn btn-secondary" disabled>
                Memuat PDF...
              </button>
            ) : (
              <button className="btn btn-primary">Download PDF</button>
            )
          }
        </PDFDownloadLink>

        <button
          className="btn btn-outline-secondary"
          onClick={handleNavigateBack}
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default NotaPenitipanPrint;