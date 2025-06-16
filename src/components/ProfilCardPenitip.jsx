import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCoins, FaMapMarkerAlt, FaAward } from 'react-icons/fa';

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
    <div className="profile-container">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div className="bg-success text-white p-4 position-relative">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-white rounded-circle p-3 me-3">
              <FaUser className="text-success" size={40} />
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{name}</h4>
              <p className="mb-0 opacity-75">Penitip ReuseMart</p>
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
                <p className="mb-0 fw-medium">{email}</p>
              </div>
            </div>
            
            <div className="profile-info d-flex align-items-center mb-3">
              <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                <FaPhone className="text-success" />
              </div>
              <div>
                <p className="text-muted mb-0 small">Nomor HP</p>
                <p className="mb-0 fw-medium">{phone}</p>
              </div>
            </div>

            <div className="profile-info d-flex align-items-center mb-3">
              <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                <FaMapMarkerAlt className="text-success" />
              </div>
              <div>
                <p className="text-muted mb-0 small">Alamat</p>
                <p className="mb-0 fw-medium">{alamat}</p>
              </div>
            </div>

            <div className="profile-info d-flex align-items-center mb-3">
              <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                <FaIdCard className="text-success" />
              </div>
              <div>
                <p className="text-muted mb-0 small">NIK</p>
                <p className="mb-0 fw-medium">{nik}</p>
              </div>
            </div>
          </div>

          <div className="reward-section bg-light p-3 rounded mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-wrapper bg-success rounded-circle p-2 me-3">
                <FaAward className="text-white" />
              </div>
              <div>
                <h5 className="mb-0">Poin Reward</h5>
                <div className="d-flex align-items-center mt-2">
                  <Badge bg="success" className="fs-5 py-2 px-3 rounded-pill">
                    {points} Poin
                  </Badge>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Dapatkan merchandise menarik dengan menukarkan poin Anda
                </p>
              </div>
            </div>
          </div>

          <div className="reward-section bg-light p-3 rounded">
            <div className="d-flex align-items-center">
              <div className="icon-wrapper bg-success rounded-circle p-2 me-3">
                <FaCoins className="text-white" />
              </div>
              <div>
                <h5 className="mb-0">Saldo</h5>
                <div className="d-flex align-items-center mt-2">
                  <Badge bg="success" className="fs-5 py-2 px-3 rounded-pill">
                    Rp {saldo.toLocaleString()}
                  </Badge>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Saldo dari hasil penjualan barang Anda
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
} 