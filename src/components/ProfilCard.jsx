import { Card, Row, Col } from 'react-bootstrap';

export default function ProfilCard({ profile }) {
  // Check what type of profile we're dealing with
  const isPembeli = profile?.nama_pembeli !== undefined;
  const isPenitip = profile?.nama_penitip !== undefined;
  
  // Safely access properties with optional chaining
  const name = isPembeli ? profile?.nama_pembeli : 
               isPenitip ? profile?.nama_penitip : 
               "Pengguna";
  
  const email = profile?.user?.email || "-";
  const phone = isPembeli ? profile?.no_hp_default : 
               isPenitip ? profile?.no_hp : 
               "-";
  const points = profile?.jumlah_poin || 0;
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5" className="bg-success text-white">
        {isPenitip ? "Profil Penitip" : "Profil Pembeli"}
      </Card.Header>
      <Card.Body>
        <Row className="mb-2">
          <Col sm={4}><strong>Nama:</strong></Col>
          <Col>{name}</Col>
        </Row>
        <Row className="mb-2">
          <Col sm={4}><strong>Email:</strong></Col>
          <Col>{email}</Col>
        </Row>
        <Row className="mb-2">
          <Col sm={4}><strong>No HP:</strong></Col>
          <Col>{phone}</Col>
        </Row>
        {isPembeli && (
          <Row className="mb-2">
            <Col sm={4}><strong>Poin Reward:</strong></Col>
            <Col>{points}</Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}