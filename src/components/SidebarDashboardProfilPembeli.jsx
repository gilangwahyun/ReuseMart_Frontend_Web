import React from "react";
import { Nav, Card } from "react-bootstrap";
import { FaUser, FaHistory, FaReceipt, FaArrowLeft } from "react-icons/fa";

const SidebarDashboardProfilPembeli = ({ activeKey, onSelect, hasSelectedTransaction = false }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5" className="bg-success text-white">
        Menu Profil
      </Card.Header>
      <Card.Body className="p-0">
        <Nav variant="pills" className="flex-column" activeKey={activeKey} onSelect={onSelect}>
          <Nav.Item>
            <Nav.Link eventKey="profile" className="rounded-0 border-bottom d-flex align-items-center">
              <FaUser className="me-2" />
              <span>Data Profil</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item>
            <Nav.Link eventKey="history" className="rounded-0 border-bottom d-flex align-items-center">
              <FaHistory className="me-2" />
              <span>Riwayat Transaksi</span>
            </Nav.Link>
          </Nav.Item>
          
          {hasSelectedTransaction && (
            <Nav.Item>
              <Nav.Link eventKey="detail" className="rounded-0 border-bottom d-flex align-items-center">
                <FaReceipt className="me-2" />
                <span>Detail Transaksi</span>
              </Nav.Link>
            </Nav.Item>
          )}
          
          <Nav.Item>
            <Nav.Link 
              as="button" 
              onClick={handleGoBack} 
              className="rounded-0 text-start border-0 d-flex align-items-center w-100"
            >
              <FaArrowLeft className="me-2" />
              <span>Kembali</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Body>
    </Card>
  );
};

export default SidebarDashboardProfilPembeli;
