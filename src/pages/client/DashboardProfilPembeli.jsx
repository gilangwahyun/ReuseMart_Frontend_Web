import { useState, useEffect } from "react";
import ProfilCard from "../../components/ProfilCard";
import ProfilDetailTransaksi from "../../components/ProfilDetailTransaksi";
import ProfilHistoriTransaksi from "../../components/ProfilHistoriTransaksi";
import SidebarDashboardProfilPembeli from "../../components/SidebarDashboardProfilPembeli";
import { getPembeliByUserId } from "../../api/PembeliApi";
import { getTransaksiByPembeli } from "../../api/TransaksiApi";
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

export default function BuyerDashboard() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Ambil data user dari localStorage

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id_user || user?.id;

  const fetchPembeliAndAlamat = async () => {
    setLoading(true);
    try {
      const data = await getPembeliByUserId(userId);
      setPembeli(data);
      
      try {
        // Coba ambil data alamat
        const alamatData = await getAlamatByPembeliId(data.id_pembeli);
        setAlamatList(alamatData || []); // Gunakan empty array jika alamatData null/undefined
      } catch (alamatError) {
        // Jika error 404 (alamat tidak ditemukan), set empty array
        if (alamatError.response?.status === 404) {
          setAlamatList([]);
        } else {
          // Jika error lain, log error tapi tetap tampilkan halaman
          console.error("Error fetching alamat:", alamatError);
          setAlamatList([]);
        }
      }
    } catch (err) {
      console.error("Error fetching pembeli data:", err);
      setError(err.message || "Failed to fetch pembeli data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User tidak ditemukan, silakan login kembali");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Ambil data pembeli berdasarkan id_user
    getPembeliByUserId(userId)
      .then((pembeli) => {
        setProfile(pembeli);
        if (pembeli) {
          // Fetch transactions milik pembeli ini
          return getTransaksiByPembeli(pembeli.id_pembeli);
        }
        throw new Error("Data pembeli tidak ditemukan");
      })
      .then((data) => {
        console.log("Loaded transactions:", data);
        setTransactions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("Gagal memuat data: " + error.message);
        setLoading(false);
      });
  }, [userId]);

  // Handler untuk memilih transaksi
  const handleSelectTransaction = (tx) => {
    console.log("Selected transaction:", tx.id_transaksi);
    setSelectedTx(tx);
    setActiveTab("detail");
  };

  // Handler untuk navigasi sidebar
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    // Jika berpindah dari detail transaksi ke tab lain, reset selected transaction
    if (tab !== "detail") {
      setSelectedTx(null);
    }
  };

  // Render content berdasarkan tab aktif
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
            key={selectedTx?.id_transaksi || 'no-transaction'}
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
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Memuat data profil...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col lg={3} md={4} className="mb-4">
          <SidebarDashboardProfilPembeli
            activeKey={activeTab}
            onSelect={handleTabSelect}
            hasSelectedTransaction={selectedTx !== null}
          />
        </Col>

        {/* Main Content */}
        <Col lg={9} md={8}>
          {renderContent()}
        </Col>
      </Row>
    </Container>

  );
};

export default DashboardProfilePembeli;