import { Card, ListGroup, Badge, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';

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
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
        <div className="history-container">
          <h5 className="text-success mb-3 border-bottom pb-2">Riwayat Transaksi Anda</h5>
          
          {transactions.length > 0 ? (
            <div className="transaction-list">
              {transactions.map((tx) => (
                <Card 
                  key={tx.id_transaksi}
                  onClick={() => onSelect(tx)}
                  className={`transaction-card border-0 shadow-sm mb-3 ${
                    selectedTransaction?.id_transaksi === tx.id_transaksi ? 'border-success border-2' : ''
                  }`}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <div className={`icon-wrapper rounded-circle p-2 me-2 ${
                          selectedTransaction?.id_transaksi === tx.id_transaksi ? 'bg-success text-white' : 'bg-light text-success'
                        }`}>
                          <FaShoppingCart />
                        </div>
                        <h6 className="mb-0 fw-bold">Transaksi #{tx.id_transaksi}</h6>
                      </div>
                      <Badge 
                        bg={selectedTransaction?.id_transaksi === tx.id_transaksi ? "success" : "light"} 
                        text={selectedTransaction?.id_transaksi === tx.id_transaksi ? "white" : "success"} 
                        className="px-3 py-2"
                      >
                        <FaMoneyBillWave className="me-1" /> 
                        Rp {tx.total_harga.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="d-flex align-items-center text-muted small">
                      <FaCalendarAlt className="me-1" />
                      {formatDate(tx.tanggal_transaksi)}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="py-3">
                  <FaShoppingCart size={50} className="text-success opacity-50 mb-3" />
                  <h5>Belum Ada Transaksi</h5>
                  <p className="text-muted">Anda belum melakukan transaksi pembelian apapun.</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
    );
}