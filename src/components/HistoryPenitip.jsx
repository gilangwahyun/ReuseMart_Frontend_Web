import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPenitip } from "../api/PenitipApi";

const PenitipDetailWithHistory = () => {
  const { id } = useParams();
  const [penitipData, setPenitipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPenitip = async () => {
      try {
        const data = await getPenitip(id);
        setPenitipData(data);
      } catch (err) {
        setError(err.message || "Failed to fetch penitip data");
      } finally {
        setLoading(false);
      }
    };

    fetchPenitip();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  if (!penitipData) return <p>No penitip data available</p>;

  return (
    <div className="container py-4">
      <h2>Detail Penitip</h2>

      <section style={{ marginTop: "2rem" }}>
        <h3>History Penitipan Barang</h3>
        {penitipData.penitipan_barang && penitipData.penitipan_barang.length > 0 ? (
          <ul>
            {penitipData.penitipan_barang.map((penitipan) => (
              <li key={penitipan.id_penitipan}>
                <p>
                  Tanggal Awal Penitipan:{" "}
                  {new Date(penitipan.tanggal_awal_penitipan).toLocaleDateString()}
                </p>
                <p>
                  Tanggal Akhir Penitipan:{" "}
                  {new Date(penitipan.tanggal_akhir_penitipan).toLocaleDateString()}
                </p>
                <p>Jumlah Barang: {penitipan.barang ? penitipan.barang.length : 0}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada history penitipan barang.</p>
        )}
      </section>

      {/* Barang List */}
      <section>
        <h3>Daftar Barang</h3>
        {penitipData.barang && penitipData.barang.length > 0 ? (
          <ul>
            {penitipData.barang.map((item) => (
              <li key={item.id_barang}>
                <h4>{item.nama_barang}</h4>
                <p>{item.deskripsi}</p>
                <p>Harga: Rp{item.harga.toLocaleString()}</p>
                <p>Masa Garansi: {item.masa_garansi || "-"}</p>
                <p>Status: {item.status_barang}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada barang untuk ditampilkan.</p>
        )}
      </section>
    </div>
  );
};

export default PenitipDetailWithHistory;