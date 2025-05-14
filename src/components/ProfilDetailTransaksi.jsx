import { useEffect, useState } from "react";
import { getDetailTransaksiByTransaksi } from "../api/DetailTransaksiApi";

export default function ProfilDetailTransaksi({ transaction, onBack }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (transaction) {
      getDetailTransaksiByTransaksi(transaction.id_transaksi)
        .then((data) => setItems(data))
        .catch((err) => setItems([]));
    } else {
      setItems([]);
    }
  }, [transaction]);

  return (
    <div className="transaction-detail">
      <h2>Detail Transaksi</h2>
      {transaction ? (
        <div>
          <p><strong>ID Transaksi:</strong> {transaction.id_transaksi}</p>
          <p><strong>Tanggal:</strong> {transaction.tanggal_transaksi}</p>
          <p><strong>Total:</strong> Rp {transaction.total_harga.toLocaleString()}</p>
          <h3>Item:</h3>
          <ul>
            {items.map((item, idx) => (
              <li key={idx}>
                {item.barang?.nama_barang} - Rp {item.harga_item.toLocaleString()}
              </li>
            ))}
          </ul>
          <button onClick={onBack}>Kembali</button>
        </div>
      ) : (
        <p>Pilih transaksi untuk melihat detail.</p>
      )}
    </div>
  );
}