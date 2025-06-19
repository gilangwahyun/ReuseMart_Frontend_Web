import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaFileAlt, FaBoxOpen, FaMoneyBillWave, FaCalendar, FaFilter } from 'react-icons/fa';

export default function ProfilHistoriTransaksiPenitip({ transactions = [], onSelect, selectedTransaction, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id_transaksi?.toString().includes(searchTerm) || 
                          tx.pembeli?.nama_pembeli?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.total_harga?.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus ? tx.status_transaksi === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'lunas':
        return <Badge bg="success">Lunas</Badge>;
      case 'belum bayar':
        return <Badge bg="warning" text="dark">Belum Bayar</Badge>;
      case 'hangus':
        return <Badge bg="danger">Hangus</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "0";
    return amount.toLocaleString();
  };

  return (
    <Card className="shadow-sm border-success">
      <Card.Header as="h5" className="bg-success text-white d-flex align-items-center">
        <FaMoneyBillWave className="me-2" /> Riwayat Transaksi Penitipan
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-3 flex-wrap">
          <div className="d-flex mb-2 mb-md-0">
            <Form.Group className="me-2">
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={filterStatus} 
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="Hangus">Hangus</option>
                </Form.Select>
              </InputGroup>
            </Form.Group>
          </div>
          
          <InputGroup style={{ maxWidth: '300px' }} size="sm">
            <Form.Control
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-success">
              <FaSearch />
            </Button>
          </InputGroup>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-2">Memuat riwayat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center my-5">
            <FaBoxOpen size={40} className="text-muted mb-3" />
            <p className="mb-0">Belum ada riwayat transaksi</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Pembeli</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr 
                    key={tx.id_transaksi}
                    className={selectedTransaction?.id_transaksi === tx.id_transaksi ? 'table-success' : ''}
                  >
                    <td>#{tx.id_transaksi}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaCalendar className="text-success me-2" /> 
                        {formatDate(tx.tanggal_transaksi)}
                      </div>
                    </td>
                    <td>{tx.pembeli?.nama_pembeli || "-"}</td>
                    <td>Rp {formatCurrency(tx.total_harga)}</td>
                    <td>{getStatusBadge(tx.status_transaksi)}</td>
                    <td>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => onSelect(tx)}
                      >
                        <FaFileAlt className="me-1" /> Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
} 