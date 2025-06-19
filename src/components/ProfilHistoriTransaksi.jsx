import { Card, ListGroup, Badge, ButtonGroup, Button, Row, Col, Tab, Nav, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaShoppingCart, FaMoneyBillWave, FaTruck, FaHandsHelping, FaFilter } from 'react-icons/fa';
import { useState } from 'react';

export default function ProfilHistoriTransaksi({ transactions, onSelect, selectedTransaction }) {
    const [statusFilter, setStatusFilter] = useState("semua");
    const [shippingFilter, setShippingFilter] = useState("semua");
    
    // Daftar status transaksi yang mungkin
    const allPossibleStatuses = ['proses', 'lunas', 'dibatalkan', 'selesai', 'pending', 'belum dibayar'];
    
    // Daftar metode pengiriman yang mungkin
    const allPossibleShippingMethods = ['Dikirim oleh Kurir', 'Diambil Mandiri'];

    // Function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to format currency safely
    const formatCurrency = (amount) => {
        if (amount == null || isNaN(amount)) return "0";
        return amount.toLocaleString();
    };
    
    // Function to get status badge color
    const getStatusBadgeColor = (status) => {
        if (!status) return 'secondary';
        
        switch (status.toLowerCase()) {
            case 'proses':
                return 'primary';
            case 'lunas':
                return 'success';
            case 'dibatalkan':
                return 'danger';
            case 'selesai':
                return 'success';
            case 'pending':
                return 'secondary';
            case 'belum dibayar':
                return 'warning';
            default:
                return 'secondary';
        }
    };
    
    // Get shipping method text
    const getShippingMethod = (method) => {
        if (!method) return null;
        
        let displayText = method;
        
        if (method.toLowerCase() === 'dikirim oleh kurir') {
            displayText = <span><FaTruck className="me-1" size={11} /> Dikirim oleh Kurir</span>;
        } else if (method.toLowerCase() === 'diambil mandiri') {
            displayText = <span><FaHandsHelping className="me-1" size={11} /> Diambil Mandiri</span>;
        }
        
        return (
            <small className="text-muted">{displayText}</small>
        );
    };
    
    // Filter transactions based on selected filters
    const filteredTransactions = transactions.filter(tx => {
        // Status filter
        const statusMatch = statusFilter === "semua" || 
            (tx.status_transaksi && tx.status_transaksi.toLowerCase() === statusFilter.toLowerCase());
        
        // Shipping method filter
        const shippingMatch = shippingFilter === "semua" || 
            (tx.metode_pengiriman && tx.metode_pengiriman.toLowerCase() === shippingFilter.toLowerCase());
        
        return statusMatch && shippingMatch;
    });

    return (
        <div className="transaction-history-container">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3 border-bottom">
                    <h5 className="mb-0 fw-semibold">Riwayat Transaksi</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="mb-4">
                        <Col xs={12}>
                            <div className="filter-controls p-3 bg-light rounded">
                                <Row className="g-2">
                                    <Col xs={12} md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-dark mb-2 small fw-medium">Status Transaksi</Form.Label>
                                            <Form.Select 
                                                size="sm"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="border"
                                            >
                                                <option value="semua">Semua Status</option>
                                                {allPossibleStatuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-dark mb-2 small fw-medium">Metode Pengiriman</Form.Label>
                                            <Form.Select 
                                                size="sm"
                                                value={shippingFilter}
                                                onChange={(e) => setShippingFilter(e.target.value)}
                                                className="border"
                                            >
                                                <option value="semua">Semua Metode</option>
                                                {allPossibleShippingMethods.map(method => (
                                                    <option key={method} value={method}>
                                                        {method === 'Dikirim oleh Kurir' ? 'Pengiriman Kurir' : 'Diambil Mandiri'}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {(statusFilter !== "semua" || shippingFilter !== "semua") && (
                                    <div className="mt-3 text-end">
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            onClick={() => {
                                                setStatusFilter("semua");
                                                setShippingFilter("semua");
                                            }}
                                        >
                                            Reset Filter
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                    
                    {filteredTransactions.length > 0 ? (
                        <div className="transaction-list">
                            <ListGroup variant="flush">
                                {filteredTransactions.map((tx) => (
                                    <ListGroup.Item 
                                        key={tx.id_transaksi}
                                        action
                                        onClick={() => onSelect(tx)}
                                        active={selectedTransaction?.id_transaksi === tx.id_transaksi}
                                        className={`border-0 border-bottom py-3 ${
                                            selectedTransaction?.id_transaksi === tx.id_transaksi ? 'bg-light' : ''
                                        }`}
                                    >
                                        <Row className="align-items-center">
                                            <Col xs={12} md={6} className="mb-2 mb-md-0">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${
                                                            selectedTransaction?.id_transaksi === tx.id_transaksi 
                                                                ? 'bg-primary bg-opacity-10' 
                                                                : 'bg-light'
                                                        }`} style={{width: '40px', height: '40px'}}>
                                                            <FaShoppingCart className="text-primary" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="mb-0 fw-medium">Transaksi #{tx.id_transaksi}</p>
                                                        <div className="d-flex align-items-center text-muted small">
                                                            <FaCalendarAlt className="me-1" size={10} />
                                                            <span>{formatDate(tx.tanggal_transaksi)}</span>
                                                        </div>
                                                        {tx.metode_pengiriman && (
                                                            <div className="mt-1">
                                                                {getShippingMethod(tx.metode_pengiriman)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <div className="d-flex justify-content-md-end align-items-center">
                                                    {tx.status_transaksi && (
                                                        <Badge 
                                                            bg={getStatusBadgeColor(tx.status_transaksi)} 
                                                            className="me-3 py-2 px-3"
                                                        >
                                                            {tx.status_transaksi}
                                                        </Badge>
                                                    )}
                                                    <div className="ms-auto ms-md-0">
                                                        <p className="mb-0 fw-bold">Rp {formatCurrency(tx.total_harga)}</p>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    ) : (
                        <Card className="border text-center my-4">
                            <Card.Body className="py-5">
                                <div className="py-4">
                                    <div className="mb-3">
                                        <FaShoppingCart size={40} className="text-secondary opacity-50" />
                                    </div>
                                    <h5 className="fw-semibold">Tidak Ada Transaksi</h5>
                                    <p className="text-muted mb-0">
                                        {statusFilter !== "semua" || shippingFilter !== "semua" ? 
                                            `Tidak ada transaksi dengan kriteria filter yang dipilih.` : 
                                            "Anda belum melakukan transaksi pembelian apapun."}
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}