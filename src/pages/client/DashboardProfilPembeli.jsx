import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import ProfilCard from "../../components/ProfilCard";
import ProfilDetailTransaksi from "../../components/ProfilDetailTransaksi";
import ProfilHistoriTransaksi from "../../components/ProfilHistoriTransaksi";
import HorizontalNavProfilPembeli from "../../components/HorizontalNavProfilPembeli";
import { getPembeliByUserId } from "../../api/PembeliApi";
import { getTransaksiByPembeli } from "../../api/TransaksiApi";

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
        console.log(pembeli);
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
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Sedang memuat dashboard Anda...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4 bg-light min-vh-100">
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <h3 className="mb-0 text-success">
                Selamat datang, {profile?.nama_pembeli || "Pengguna"}
              </h3>
              <p className="text-muted mb-0">
                Berikut adalah informasi akun dan transaksi Anda.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Nav horizontal di atas */}
      <Row className="mb-3">
        <Col>
          <HorizontalNavProfilPembeli
            activeKey={activeTab}
            onSelect={handleTabSelect}
            hasSelectedTransaction={selectedTx !== null}
          />
        </Col>
      </Row>

      {/* Konten utama */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm p-3">{renderContent()}</Card>
        </Col>
      </Row>
    </Container>
  );
}