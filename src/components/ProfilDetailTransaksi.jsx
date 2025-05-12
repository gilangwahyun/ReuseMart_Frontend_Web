export default function ProfilDetailTransaksi({ transaction, onBack }) {
    return (
        <div className="transaction-detail">
          <h2>Detail Transaksi</h2>
          {transaction ? (
            <div>
              <p><strong>ID Transaksi:</strong> {transaction.id}</p>
              <p><strong>Tanggal:</strong> {transaction.date}</p>
              <p><strong>Total:</strong> Rp {transaction.total.toLocaleString()}</p>
              <h3>Item:</h3>
              <ul>
                {transaction.items.map((item, idx) => (
                  <li key={idx}>{item.quantity}x {item.name} - Rp {item.price.toLocaleString()}</li>
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