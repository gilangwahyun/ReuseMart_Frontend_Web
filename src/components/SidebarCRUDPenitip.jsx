import React from "react";
import { Nav, Card } from "react-bootstrap";
import { FaUserPlus, FaList, FaEdit, FaArrowLeft } from "react-icons/fa";

const SidebarCRUDPenitip = ({ activeKey, onSelect, hasSelectedPenitip = false }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5" className="bg-success text-white">
        Menu Penitip
      </Card.Header>
      <Card.Body className="p-0">
        <Nav variant="pills" className="flex-column" activeKey={activeKey} onSelect={onSelect}>
          <Nav.Item>
            <Nav.Link eventKey="list" className="rounded-0 border-bottom d-flex align-items-center">
              <FaList className="me-2" />
              <span>Daftar Penitip</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item>
            <Nav.Link eventKey="register" className="rounded-0 border-bottom d-flex align-items-center">
              <FaUserPlus className="me-2" />
              <span>Registrasi Penitip</span>
            </Nav.Link>
          </Nav.Item>
          
          {hasSelectedPenitip && (
            <Nav.Item>
              <Nav.Link eventKey="detail" className="rounded-0 border-bottom d-flex align-items-center">
                <FaEdit className="me-2" />
                <span>Detail/Edit Penitip</span>
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

export default SidebarCRUDPenitip;
