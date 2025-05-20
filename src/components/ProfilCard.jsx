import { Card, Row, Col } from 'react-bootstrap';

export default function ProfilCard({ profile }) {
    return (
        <Card className="shadow-sm mb-4">
          <Card.Header as="h5" className="bg-success text-white">
            Profil Pembeli
          </Card.Header>
          <Card.Body>
            <Row className="mb-2">
              <Col sm={4}><strong>Nama:</strong></Col>
              <Col>{profile.nama_pembeli}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4}><strong>No HP:</strong></Col>
              <Col>{profile.no_hp_default}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4}><strong>Poin Reward:</strong></Col>
              <Col>{profile.jumlah_poin}</Col>
            </Row>
          </Card.Body>
        </Card>
      );
}