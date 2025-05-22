import { Card, ListGroup, Badge, Alert } from 'react-bootstrap';

export default function ProfilHistoriTransaksi({ transactions, onSelect, selectedTransaction }) {
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
                      <span><strong>ID:</strong> {tx.id_transaksi}</span>
                      <Badge bg={selectedTransaction?.id_transaksi === tx.id_transaksi ? "light" : "success"} 
                             text={selectedTransaction?.id_transaksi === tx.id_transaksi ? "dark" : "white"} 
                             pill>
                        Rp {tx.total_harga.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="text-muted small mt-1">
                      <strong>Tanggal:</strong> {tx.tanggal_transaksi}
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