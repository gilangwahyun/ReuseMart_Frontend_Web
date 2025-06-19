import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { getPenitipByUserId, getTransaksiByPenitipId } from "../../api/PenitipApi";
import ProfilCardPenitip from "../../components/ProfilCardPenitip";
import ProfilDetailTransaksiPenitip from "../../components/ProfilDetailTransaksiPenitip";
import ProfilHistoriTransaksiPenitip from "../../components/ProfilHistoriTransaksiPenitip";
import HorizontalNavProfilPenitip from "../../components/HorizontalNavProfilPenitip";
import DaftarPenitipanBarang from "../../components/penitip/DaftarPenitipanBarang";
import RequestPengambilanBarang from "../../components/penitip/RequestPengambilanBarang";
import RequestPerpanjanganPenitipan from "../../components/penitip/RequestPerpanjanganPenitipan";

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

    const fetchPenitipData = async () => {
      try {
        setLoading(true);

        // Ambil data penitip
        const response = await getPenitipByUserId(id_user);
        console.log("Raw API response:", response);
        
        // For consistency with DashboardProfilPembeli, use the entire response object
        // (which might have a nested 'data' property) as the profile
        console.log("Setting profile with response object:", response);
        setProfile(response);
      } catch (err) {
        console.error("Error fetching penitip data:", err);
        setError("Gagal memuat data: " + (err.message || "Terjadi kesalahan"));
      } finally {
        setLoading(false);
      }
    };

    fetchPenitipData();
  }, [id_user]);

  // Efek terpisah untuk mengambil transaksi setelah profil dimuat
  useEffect(() => {
    if (!profile || !profile.data) return;
    
    const fetchTransactions = async () => {
      const penitipId = profile.data.id_penitip;
      
      if (penitipId) {
        try {
          console.log(`Fetching transactions for penitip ID: ${penitipId}`);
          const transaksiData = await getTransaksiByPenitipId(penitipId);
          console.log("Transaction data:", transaksiData);
          
          // Handle possible nested response structure
          const transactionList = transaksiData?.data || transaksiData || [];
          setTransactions(transactionList);
        } catch (txError) {
          console.error("Error fetching transactions:", txError);
          setTransactions([]);
        }
      } else {
        console.warn("No penitip ID found, skipping transaction fetch");
        setTransactions([]);
      }
    };
    
    fetchTransactions();
  }, [profile]);

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
    if (!profile || !profile.data) {
      return <Alert variant="info">Memuat data profil...</Alert>;
    }

    const penitipId = profile.data.id_penitip;

    switch (activeTab) {
      case "profile":
        return <ProfilCardPenitip penitip={profile} />;
      
      case "penitipan":
        return <DaftarPenitipanBarang idPenitip={penitipId} />;
      
      case "request-pengambilan":
        return <RequestPengambilanBarang idPenitip={penitipId} />;
      
      case "request-perpanjangan":
        return <RequestPerpanjanganPenitipan idPenitip={penitipId} />;
      
      case "history":
        return (
          <ProfilHistoriTransaksiPenitip
            transactions={transactions}
            onSelect={handleSelectTransaction}
            selectedTransaction={selectedTx}
            loading={loading}
          />
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
        return <ProfilCardPenitip penitip={profile} />;
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
                Selamat datang, {profile?.data?.nama_penitip || "Penitip"}
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