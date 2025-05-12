export default function ProfilHistoriTransaksi({ transactions, onSelect }) {
    return (
        <div className="transaction-list">
          <h2>Riwayat Transaksi</h2>
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item" onClick={() => onSelect(tx)}>
              <p><strong>ID:</strong> {tx.id}</p>
              <p><strong>Tanggal:</strong> {tx.date}</p>
              <p><strong>Total:</strong> Rp {tx.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      );
}