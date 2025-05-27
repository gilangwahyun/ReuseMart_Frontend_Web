import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import ProfilCard from "../../components/ProfilCard";
import ProfilDetailTransaksi from "../../components/ProfilDetailTransaksi";
import ProfilHistoriTransaksi from "../../components/ProfilHistoriTransaksi";
import HorizontalNavProfilPembeli from "../../components/HorizontalNavProfilPembeli";
import { getPembeliByUserId } from "../../api/PembeliApi";
import { getTransaksiByPembeli } from "../../api/TransaksiApi";
import { FaUser, FaUserCircle } from "react-icons/fa";

export default function DashboardProfilePembeli() {
  const { id_user } = useParams();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!id_user) {
      setError("ID user tidak ditemukan di URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const pembeli = await getPembeliByUserId(id_user);
        setProfile(pembeli);

        const transaksiList = await getTransaksiByPembeli(pembeli.id_pembeli);
        setTransactions(transaksiList);
      } catch (err) {
        setError("Gagal memuat data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_user]);

  const handleSelectTransaction = (tx) => {
    setSelectedTx(tx);
    setActiveTab("detail");
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    if (tab !== "detail") {
      setSelectedTx(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return profile && <ProfilCard profile={profile} />;
      case "history":
        return (
          <ProfilHistoriTransaksi
            transactions={transactions}
            onSelect={handleSelectTransaction}
            selectedTransaction={selectedTx}
          />
        );
      case "detail":
        return (
          <ProfilDetailTransaksi
            key={selectedTx?.id_transaksi || "no-transaction"}
            transaction={selectedTx}
            onBack={() => setActiveTab("history")}
          />
        );
      default:
        return profile && <ProfilCard profile={profile} />;
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5 px-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Sedang memuat profil Anda...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5 px-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center shadow-sm">
          <h5 className="mb-2">Terjadi Kesalahan</h5>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0 bg-light min-vh-100">
      {/* Header Hero Section */}
      <div className="bg-success text-white py-4 px-4 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col xs="auto">
              <div className="bg-white rounded-circle p-3 shadow-sm">
                <FaUserCircle size={50} className="text-success" />
              </div>
            </Col>
            <Col>
              <h3 className="fw-bold mb-1">
                Halo, {profile?.nama_pembeli || "Pengguna"}!
              </h3>
              <p className="mb-0 opacity-75">
                Selamat datang di Dashboard Profil ReuseMart
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Nav horizontal di atas */}
        <HorizontalNavProfilPembeli
          activeKey={activeTab}
          onSelect={handleTabSelect}
          hasSelectedTransaction={selectedTx !== null}
        />

        {/* Konten utama */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </Container>
    </Container>
  );
}