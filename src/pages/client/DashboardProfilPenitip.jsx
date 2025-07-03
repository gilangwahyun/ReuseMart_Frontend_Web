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
import { FaUserCircle } from "react-icons/fa";
import PenarikanSaldo from "./PenarikanSaldoPage";

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

      case "penarikan-saldo":
        return <PenarikanSaldo idUser={id_user}/>;
      
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
                Halo, {profile?.data?.nama_penitip || "Penitip"}!
              </h3>
              <p className="mb-0 opacity-75">
                Selamat datang di Dashboard Profil Penitip ReuseMart
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Nav horizontal di atas */}
        <HorizontalNavProfilPenitip
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