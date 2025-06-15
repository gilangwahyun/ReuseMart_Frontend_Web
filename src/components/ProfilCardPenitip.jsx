import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCoins, FaMapMarkerAlt } from 'react-icons/fa';

export default function ProfilCardPenitip({ penitip }) {
  // Check if penitip is available
  if (!penitip) {
    return (
      <Card className="shadow-sm mb-4 border-success">
        <Card.Header as="h5" className="bg-success text-white d-flex align-items-center">
          <FaUser className="me-2" /> Profil Penitip
        </Card.Header>
        <Card.Body className="text-center">
          <p>Data penitip tidak tersedia</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Use data property if available, otherwise use direct properties
  const penitipData = penitip.data || penitip;
  
  // Safely access properties with optional chaining
  const name = penitipData?.nama_penitip || "Penitip";
  
  // Handle email from nested user object or from direct user property
  let email = "-";
  if (penitipData.user && penitipData.user.email) {
    email = penitipData.user.email;
  } else if (penitipData.email) {
    email = penitipData.email;
  }
  
  const phone = penitipData?.no_telepon || "-";
  const alamat = penitipData?.alamat || "-";
  const nik = penitipData?.nik || "-";
  const saldo = penitipData?.saldo || 0;
  const points = penitipData?.jumlah_poin || 0;
  
  return (
    <Card className="shadow-sm mb-4 border-success">
      <Card.Header as="h5" className="bg-success text-white d-flex align-items-center">
        <FaUser className="me-2" /> Profil Penitip
      </Card.Header>
      <Card.Body>
        <div className="mb-3 text-center">
          <div 
            className="rounded-circle bg-light mx-auto d-flex align-items-center justify-content-center"
            style={{ width: '100px', height: '100px' }}
          >
            <FaUser size={40} className="text-success" />
          </div>
          <h4 className="mt-3">{name}</h4>
          <Badge bg="success" className="px-3 py-2">Penitip</Badge>
        </div>

        <hr className="my-4" />
        
        <Row className="mb-3">
          <Col sm={4} className="d-flex align-items-center">
            <FaEnvelope className="me-2 text-success" /> <strong>Email:</strong>
          </Col>
          <Col>{email}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4} className="d-flex align-items-center">
            <FaPhone className="me-2 text-success" /> <strong>No HP:</strong>
          </Col>
          <Col>{phone}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4} className="d-flex align-items-center">
            <FaMapMarkerAlt className="me-2 text-success" /> <strong>Alamat:</strong>
          </Col>
          <Col>{alamat}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4} className="d-flex align-items-center">
            <FaIdCard className="me-2 text-success" /> <strong>NIK:</strong>
          </Col>
          <Col>{nik}</Col>
        </Row>
        <Row className="mb-3">
          <Col sm={4} className="d-flex align-items-center">
            <FaCoins className="me-2 text-success" /> <strong>Saldo:</strong>
          </Col>
          <Col>Rp {saldo ? saldo.toLocaleString() : '0'}</Col>
        </Row>
        {points && points > 0 && (
          <Row className="mb-3">
            <Col sm={4} className="d-flex align-items-center">
              <FaCoins className="me-2 text-success" /> <strong>Poin:</strong>
            </Col>
            <Col>{points.toLocaleString()} poin</Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
} 