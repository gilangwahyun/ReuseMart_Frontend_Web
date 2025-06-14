import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { getPenitipByUserId, getTransaksiByPenitipId } from "../../api/PenitipApi";
import ProfilCardPenitip from "../../components/ProfilCardPenitip";
import ProfilDetailTransaksiPenitip from "../../components/ProfilDetailTransaksiPenitip";
import ProfilHistoriTransaksiPenitip from "../../components/ProfilHistoriTransaksiPenitip";
import HorizontalNavProfilPenitip from "../../components/HorizontalNavProfilPenitip";

export default function DashboardProfilPenitip() {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "profile");

  useEffect(() => {
    if (!id_user) {
      setError("ID user tidak ditemukan di URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Ambil data penitip
        const response = await getPenitipByUserId(id_user);
        console.log("Raw API response:", response);
        
        // Handle different response structures
        let penitipData = null;
        
        if (response.success && response.data) {
          // Format: { success: true, message: "...", data: { ... } }
          console.log("Using response.data format");
          penitipData = response.data;
        } else if (response.id_penitip) {
          // Format: { id_penitip: ..., ... }
          console.log("Using direct object format");
          penitipData = response;
        } else {
          console.error("Unexpected API response format:", response);
          throw new Error("Format data tidak valid");
        }
        
        console.log("Extracted penitip data:", penitipData);
        setProfile(penitipData);
        
        // Fetch transactions if penitip data is available
        if (penitipData && penitipData.id_penitip) {
          try {
            console.log(`Fetching transactions for penitip ID: ${penitipData.id_penitip}`);
            const transaksiData = await getTransaksiByPenitipId(penitipData.id_penitip);
            console.log("Transaction data:", transaksiData);
            setTransactions(transaksiData || []);
          } catch (txError) {
            console.error("Error fetching transactions:", txError);
            setTransactions([]);
          }
        } else {
          console.warn("No penitip ID found, skipping transaction fetch");
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching penitip data:", err);
        setError("Gagal memuat data: " + (err.message || "Terjadi kesalahan"));
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
    
    if (tab === "barang") {
      navigate("/DashboardBarangPenitip");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return profile && (
          <>
            <ProfilCardPenitip penitip={profile} />
          </>
        );
      case "history":
        return (
          <>
            <ProfilHistoriTransaksiPenitip
              transactions={transactions}
              onSelect={handleSelectTransaction}
              selectedTransaction={selectedTx}
              loading={loading}
            />
          </>
        );
      case "detail":
        return (
          <ProfilDetailTransaksiPenitip
            key={selectedTx?.id_transaksi || "no-transaction"}
            transaction={selectedTx}
            onBack={() => setActiveTab("history")}
          />
        );
      default:
        return profile && <ProfilCardPenitip penitip={profile} />;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Sedang memuat dashboard Anda...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">{error}</Alert>
        <div className="text-center mt-3">
          <button 
            className="btn btn-success" 
            onClick={() => navigate('/')}
          >
            Kembali ke Beranda
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4 bg-light min-vh-100">
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm border-success">
            <Card.Body className="py-3">
              <h3 className="mb-0 text-success">
                Selamat datang, {profile?.nama_penitip || "Penitip"}
              </h3>
              <p className="text-muted mb-0">
                Berikut adalah informasi akun penitip Anda.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Nav horizontal di atas */}
      <Row className="mb-3">
        <Col>
          <HorizontalNavProfilPenitip
            activeKey={activeTab}
            onSelect={handleTabSelect}
            hasSelectedTransaction={selectedTx !== null}
          />
        </Col>
      </Row>

      {/* Konten utama */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm p-3 border-success">{renderContent()}</Card>
        </Col>
      </Row>
    </Container>
  );
} 