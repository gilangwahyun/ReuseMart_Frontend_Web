import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaAward } from 'react-icons/fa';

export default function ProfilCard({ profile }) {
    return (
      <div className="profile-container">
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <div className="bg-success text-white p-4 position-relative">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-white rounded-circle p-3 me-3">
                <FaUser className="text-success" size={40} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{profile?.data?.nama_pembeli || "Pengguna"}</h4>
                <p className="mb-0 opacity-75">Member ReuseMart</p>
              </div>
            </div>
          </div>

          <Card.Body className="p-4">
            <div className="mb-4">
              <h5 className="text-success mb-3 border-bottom pb-2">Informasi Pribadi</h5>
              
              <div className="profile-info d-flex align-items-center mb-3">
                <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                  <FaEnvelope className="text-success" />
                </div>
                <div>
                  <p className="text-muted mb-0 small">Email</p>
                  <p className="mb-0 fw-medium">{profile?.data?.user?.email || "-"}</p>
                </div>
              </div>
              
              <div className="profile-info d-flex align-items-center">
                <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                  <FaPhone className="text-success" />
                </div>
                <div>
                  <p className="text-muted mb-0 small">Nomor HP</p>
                  <p className="mb-0 fw-medium">{profile?.data?.no_hp_default || "-"}</p>
                </div>
              </div>
            </div>

            <div className="reward-section bg-light p-3 rounded">
              <div className="d-flex align-items-center">
                <div className="icon-wrapper bg-success rounded-circle p-2 me-3">
                  <FaAward className="text-white" />
                </div>
                <div>
                  <h5 className="mb-0">Poin Reward</h5>
                  <div className="d-flex align-items-center mt-2">
                    <Badge bg="success" className="fs-5 py-2 px-3 rounded-pill">
                      {profile?.data?.jumlah_poin || 0} Poin
                    </Badge>
                  </div>
                  <p className="text-muted small mt-2 mb-0">
                    Dapatkan merchandise menarik dengan menukarkan poin Anda
                  </p>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
}