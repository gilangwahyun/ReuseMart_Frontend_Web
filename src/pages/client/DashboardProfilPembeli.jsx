import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import ProfilCard from "../../components/ProfilCard";
import ProfilDetailTransaksi from "../../components/ProfilDetailTransaksi";
import ProfilHistoriTransaksi from "../../components/ProfilHistoriTransaksi";
import HorizontalNavProfilPembeli from "../../components/HorizontalNavProfilPembeli";
import { getPembeliByUserId } from "../../api/PembeliApi";
import { getTransaksiByPembeli } from "../../api/TransaksiApi";
import { createAlamat, updateAlamat, getAlamatByPembeliId, deleteAlamat } from "../../api/AlamatApi";
import AlamatForm from "../../components/AlamatForm";

export default function DashboardProfilePembeli() {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "profile");
  
  // Alamat state
  const [alamatList, setAlamatList] = useState([]);
  const [selectedAlamat, setSelectedAlamat] = useState(null);
  const [alamatLoading, setAlamatLoading] = useState(false);
  const [alamatError, setAlamatError] = useState("");

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
        
        // Fetch alamat data
        try {
          setAlamatLoading(true);
          const alamatData = await getAlamatByPembeliId(pembeli.id_pembeli);
          setAlamatList(alamatData || []);
          setAlamatLoading(false);
        } catch (alamatError) {
          if (alamatError.response?.status === 404) {
            setAlamatList([]);
          } else {
            console.error("Error fetching alamat:", alamatError);
            setAlamatError("Gagal memuat data alamat");
          }
          setAlamatLoading(false);
        }
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
  
  // Alamat management functions
  const handleCreateAlamat = async (alamatData) => {
    try {
      setAlamatLoading(true);
      const newAlamat = await createAlamat({ ...alamatData, id_pembeli: profile.id_pembeli });
      setAlamatList(prev => [...prev, newAlamat]);
      setSelectedAlamat(null);
      setAlamatLoading(false);
    } catch (err) {
      console.error("Error creating alamat:", err);
      setAlamatError(err.message || "Gagal membuat alamat baru");
      setAlamatLoading(false);
    }
  };

  const handleEditAlamat = async (alamatData) => {
    try {
      setAlamatLoading(true);
      const updatedAlamat = await updateAlamat(selectedAlamat.id_alamat, alamatData);
      setAlamatList(prev => prev.map(alamat => 
        alamat.id_alamat === updatedAlamat.id_alamat ? updatedAlamat : alamat
      ));
      setSelectedAlamat(null);
      setAlamatLoading(false);
    } catch (err) {
      console.error("Error updating alamat:", err);
      setAlamatError(err.message || "Gagal mengupdate alamat");
      setAlamatLoading(false);
    }
  };

  const handleDeleteAlamat = async (id_alamat) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus alamat ini?")) return;
    try {
      setAlamatLoading(true);
      await deleteAlamat(id_alamat);
      setAlamatList(prev => prev.filter(alamat => alamat.id_alamat !== id_alamat));
      setAlamatLoading(false);
    } catch (err) {
      console.error("Error deleting alamat:", err);
      setAlamatError(err.message || "Gagal menghapus alamat");
      setAlamatLoading(false);
    }
  };

  const renderAlamatContent = () => {
    return (
      <Card>
        <Card.Header as="h5" className="bg-success text-white">
          Manajemen Alamat
        </Card.Header>
        <Card.Body>
          <h6 className="mb-3">Tambah/Edit Alamat</h6>
          <AlamatForm
            onSubmit={selectedAlamat ? handleEditAlamat : handleCreateAlamat}
            existingAlamat={selectedAlamat}
            onCancel={() => setSelectedAlamat(null)}
          />
          
          <h6 className="mt-4 mb-3">Daftar Alamat</h6>
          {alamatLoading ? (
            <div className="text-center my-3">
              <Spinner animation="border" variant="success" size="sm" />
              <p className="mt-2 small">Memuat data alamat...</p>
            </div>
          ) : alamatError ? (
            <Alert variant="danger">{alamatError}</Alert>
          ) : (
            <table className="table table-bordered mt-3">
              <thead className="thead-light">
                <tr>
                  <th>Label</th>
                  <th>Alamat Lengkap</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {alamatList.length > 0 ? (
                  alamatList.map((alamat, index) => {
                    const key = alamat.id_alamat ?? index;
                    return (
                      <tr key={key}>
                        <td>{alamat.label_alamat}</td>
                        <td>{alamat.alamat_lengkap}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedAlamat(alamat)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm m-2"
                            onClick={() => handleDeleteAlamat(alamat.id_alamat)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">Belum ada alamat</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card.Body>
      </Card>
    );
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
      case "alamat":
        return renderAlamatContent();
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