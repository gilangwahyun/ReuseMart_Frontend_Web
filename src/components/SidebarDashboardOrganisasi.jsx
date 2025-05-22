import React from "react";
import { Nav, Card } from "react-bootstrap";
import { FaClipboardList, FaPlus, FaUserAlt, FaChartBar, FaArrowLeft } from "react-icons/fa";

const SidebarDashboardOrganisasi = ({ activeKey, onSelect }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  // Make sure activeKey is always a string and has a default value
  const safeActiveKey = activeKey || 'profile';
  
  // Ensure onSelect is a function
  const handleSelect = (key) => {
    if (typeof onSelect === 'function') {
      onSelect(key);
    } else {
      console.error("onSelect is not a function in SidebarDashboardOrganisasi");
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5" className="bg-success text-white">
        Menu Organisasi
      </Card.Header>
      <Card.Body className="p-0">
        <Nav variant="pills" className="flex-column" activeKey={safeActiveKey} onSelect={handleSelect}>
          <Nav.Item>
            <Nav.Link eventKey="profile" className="rounded-0 border-bottom d-flex align-items-center">
              <FaUserAlt className="me-2" />
              <span>Profil Organisasi</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item>
            <Nav.Link eventKey="list-request" className="rounded-0 border-bottom d-flex align-items-center">
              <FaClipboardList className="me-2" />
              <span>Daftar Request Donasi</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item>
            <Nav.Link eventKey="create-request" className="rounded-0 border-bottom d-flex align-items-center">
              <FaPlus className="me-2" />
              <span>Buat Request Donasi</span>
            </Nav.Link>
          </Nav.Item>
          
          <Nav.Item>
            <Nav.Link eventKey="statistics" className="rounded-0 border-bottom d-flex align-items-center">
              <FaChartBar className="me-2" />
              <span>Statistik Donasi</span>
            </Nav.Link>
          </Nav.Item>
          
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

export default SidebarDashboardOrganisasi;
