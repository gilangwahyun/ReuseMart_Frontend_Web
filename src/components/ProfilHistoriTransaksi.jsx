export default function ProfilHistoriTransaksi({ transactions, onSelect }) {
    return (
        <div className="transaction-list">
          <h2>Riwayat Transaksi</h2>
          {transactions.map((tx) => (
            <div key={tx.id_transaksi} className="transaction-item" onClick={() => onSelect(tx)}>
              <p><strong>ID:</strong> {tx.id_transaksi}</p>
              <p><strong>Tanggal:</strong> {tx.tanggal_transaksi}</p>
              <p><strong>Total:</strong> Rp {tx.total_harga.toLocaleString()}</p>
            </div>
          ))}
        </div>
      );
}