import { Card, ListGroup, Badge, Alert } from 'react-bootstrap';

export default function ProfilHistoriTransaksi({ transactions, onSelect, selectedTransaction }) {
    // Function to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Function to format currency safely
    const formatCurrency = (amount) => {
        if (amount == null || isNaN(amount)) return "0";
        return amount.toLocaleString();
    };

    return (
        <Card className="shadow-sm mb-4">
          <Card.Header as="h5" className="bg-success text-white">
            Riwayat Transaksi
          </Card.Header>
          <Card.Body>
            {transactions.length > 0 ? (
              <ListGroup>
                {transactions.map((tx) => (
                  <ListGroup.Item 
                    key={tx.id_transaksi} 
                    action 
                    onClick={() => onSelect(tx)}
                    className={`mb-2 d-flex flex-column ${selectedTransaction?.id_transaksi === tx.id_transaksi ? 'active' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span><strong>Tanggal:</strong> {formatDate(tx.tanggal_transaksi)}</span>
                      <Badge bg={selectedTransaction?.id_transaksi === tx.id_transaksi ? "light" : "success"} 
                             text={selectedTransaction?.id_transaksi === tx.id_transaksi ? "dark" : "white"} 
                             pill>
                        Rp {formatCurrency(tx.total_harga)}
                      </Badge>
                    </div>
                    <div className="text-muted small mt-1">
                      <strong>Status:</strong> {tx.status_transaksi || 'Pending'}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="light" className="text-center text-muted">
                Belum ada transaksi.
              </Alert>
            )}
          </Card.Body>
        </Card>
      );
}