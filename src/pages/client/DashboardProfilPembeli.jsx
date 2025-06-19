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
import { createAlamat, updateAlamat, getAlamatByPembeliId, deleteAlamat, setDefaultAlamat } from "../../api/AlamatApi";
import AlamatForm from "../../components/AlamatForm";
import { FaUser, FaUserCircle, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { BiHomeAlt } from "react-icons/bi";
import { MdEdit, MdDelete, MdLocationOn, MdPhone, MdAddLocation } from "react-icons/md";

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
  const [showAlamatForm, setShowAlamatForm] = useState(false);

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
        console.log("Pembeli data from API:", pembeli);
        console.log("Pembeli data from API:", pembeli.data.id_pembeli);
        setProfile(pembeli);

        const transaksiResponse = await getTransaksiByPembeli(pembeli.data.id_pembeli);
        console.log("Transaction response:", transaksiResponse);
        
        // Check the structure of the response and extract the data array
        if (transaksiResponse && transaksiResponse.data) {
          setTransactions(transaksiResponse.data);
        } else {
          setTransactions([]);
        }
        
        // Fetch alamat data
        try {
          setAlamatLoading(true);
          const alamatData = await getAlamatByPembeliId(pembeli.data.id_pembeli);
          setAlamatList(alamatData || []);
          setAlamatError(""); // Clear any previous errors
        } catch (alamatError) {
          console.error("Error fetching alamat:", alamatError);
          
          // Jika error 404, berarti belum ada alamat yang tersimpan (bukan error sebenarnya)
          if (alamatError.response?.status === 404) {
            setAlamatList([]);
            setAlamatError(""); // Tidak perlu menampilkan error
          } else {
            // Untuk error lainnya, tampilkan pesan yang lebih informatif
            setAlamatError("Terjadi kesalahan saat memuat data alamat. Silakan coba lagi nanti.");
          }
        } finally {
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
      setAlamatError(""); // Clear any previous errors
      const newAlamat = await createAlamat({ ...alamatData, id_pembeli: profile.data.id_pembeli });
      setAlamatList(prev => [...prev, newAlamat.data]);
      setSelectedAlamat(null);
      setShowAlamatForm(false); // Hide form after successful creation
    } catch (err) {
      console.error("Error creating alamat:", err);
      setAlamatError("Gagal menambahkan alamat baru. Silakan periksa data Anda dan coba lagi.");
    } finally {
      setAlamatLoading(false);
    }
  };

  const handleSetDefaultAlamat = async (id_alamat) => {
    try {
      setAlamatLoading(true);
      setAlamatError(""); // Clear any previous errors
      
      // Pastikan profile.data.id_pembeli tersedia
      if (!profile || !profile.data || !profile.data.id_pembeli) {
        throw new Error("Data pembeli tidak tersedia");
      }
      
      // Panggil setDefaultAlamat dengan id_alamat dan id_pembeli
      await setDefaultAlamat(id_alamat, profile.data.id_pembeli);
      
      // Update UI dengan menyetel alamat yang dipilih sebagai default
      setAlamatList(prev => prev.map(alamat => ({
        ...alamat,
        is_default: alamat.id_alamat === id_alamat
      })));
      
      // Tampilkan notifikasi
      const toast = document.createElement('div');
      toast.className = 'alert alert-success alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <strong>Berhasil!</strong> Alamat telah diatur sebagai alamat default.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      
      // Tambahkan notifikasi ke halaman
      const container = document.querySelector('.address-management-container');
      if (container) {
        container.insertBefore(toast, container.firstChild);
        
        // Hapus notifikasi setelah 3 detik
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 150);
        }, 3000);
      }
    } catch (err) {
      console.error("Error setting default alamat:", err);
      setAlamatError("Gagal mengatur alamat default. Silakan coba lagi nanti.");
    } finally {
      setAlamatLoading(false);
    }
  };

  const handleEditAlamat = async (alamatData) => {
    try {
      setAlamatLoading(true);
      setAlamatError(""); // Clear any previous errors
      const updatedAlamat = await updateAlamat(selectedAlamat.id_alamat, alamatData);
      setAlamatList(prev => prev.map(alamat => 
        alamat.id_alamat === updatedAlamat.data.id_alamat ? updatedAlamat.data : alamat
      ));
      setSelectedAlamat(null);
      setShowAlamatForm(false); // Hide form after successful update
    } catch (err) {
      console.error("Error updating alamat:", err);
      setAlamatError("Gagal mengupdate alamat. Silakan periksa data Anda dan coba lagi.");
    } finally {
      setAlamatLoading(false);
    }
  };

  const handleDeleteAlamat = async (id_alamat) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus alamat ini?")) return;
    try {
      setAlamatLoading(true);
      setAlamatError(""); // Clear any previous errors
      await deleteAlamat(id_alamat);
      setAlamatList(prev => prev.filter(alamat => alamat.id_alamat !== id_alamat));
    } catch (err) {
      console.error("Error deleting alamat:", err);
      setAlamatError("Gagal menghapus alamat. Silakan coba lagi nanti.");
    } finally {
      setAlamatLoading(false);
    }
  };

  const renderAlamatContent = () => {
    return (
      <div className="address-management-container">
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header as="h5" className="bg-success text-white py-3 d-flex align-items-center">
            <BiHomeAlt className="me-2" /> Manajemen Alamat
          </Card.Header>
          
          <Card.Body className="p-4">
            {/* Alert untuk error */}
            {alamatError && (
              <Alert variant="danger" className="mb-4" dismissible onClose={() => setAlamatError("")}>
                <Alert.Heading>Terjadi Kesalahan</Alert.Heading>
                <p className="mb-0">{alamatError}</p>
              </Alert>
            )}
            
            {/* Address Form Section - conditionally shown */}
            {showAlamatForm && (
              <div id="add-address-section" className={`address-form-section p-3 mb-4 rounded bg-light border`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    {selectedAlamat ? "Edit Alamat" : "Tambah Alamat Baru"}
                  </h5>
                  <button 
                    className="btn btn-close" 
                    onClick={() => {
                      setShowAlamatForm(false);
                      setSelectedAlamat(null);
                    }}
                  ></button>
                </div>
                <AlamatForm
                  onSubmit={selectedAlamat ? handleEditAlamat : handleCreateAlamat}
                  existingAlamat={selectedAlamat}
                  onCancel={() => {
                    setSelectedAlamat(null);
                    setShowAlamatForm(false);
                  }}
                />
              </div>
            )}
            
            {/* Address List Section */}
            <div className="address-list-section">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="fw-bold mb-0">Daftar Alamat Tersimpan</h5>
                {!showAlamatForm && (
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      setShowAlamatForm(true);
                      setSelectedAlamat(null);
                    }}
                  >
                    <FaPlus className="me-1" size={12} /> Tambah Alamat Baru
                  </button>
                )}
              </div>
              
              {alamatLoading ? (
                <div className="text-center my-4 py-3">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-3 text-muted">Memuat data alamat...</p>
                </div>
              ) : alamatList.length > 0 ? (
                <div className="address-cards">
                  <Row xs={1} md={2} className="g-4">
                    {alamatList.map((alamat, index) => {
                      const key = alamat.id_alamat ?? index;
                      return (
                        <Col key={key}>
                          <Card className="h-100 border-0 shadow-sm hover-effect">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-success me-2">{alamat.label_alamat}</span>
                                  {alamat.is_default && <span className="badge bg-primary">Default</span>}
                                </div>
                                <div className="dropdown">
                                  <button className="btn btn-outline-secondary btn-sm" type="button" disabled>
                                    <MdLocationOn className="me-1" size={12} /> {alamat.is_default ? "Default" : ""}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="address-details mt-2">
                                <p className="fw-bold mb-1">{alamat.nama_penerima || "Penerima"}</p>
                                <div className="d-flex align-items-center mb-1">
                                  <MdPhone size={14} className="text-muted me-2" />
                                  <p className="small mb-0">{alamat.no_hp || "-"}</p>
                                </div>
                                <div className="d-flex align-items-start">
                                  <MdLocationOn size={14} className="text-muted me-2 mt-1" />
                                  <p className="mb-0 text-muted">{alamat.alamat_lengkap}</p>
                                </div>
                              </div>
                              
                              <div className="address-actions d-flex mt-3 pt-2 border-top">
                                <button 
                                  className="btn btn-outline-primary btn-sm me-2"
                                  onClick={() => {
                                    setSelectedAlamat(alamat);
                                    setShowAlamatForm(true);
                                  }}
                                >
                                  <MdEdit className="me-1" size={12} /> Edit
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteAlamat(alamat.id_alamat)}
                                >
                                  <MdDelete className="me-1" size={12} /> Hapus
                                </button>
                                {!alamat.is_default && (
                                  <button 
                                    className="btn btn-success btn-sm ms-auto"
                                    onClick={() => handleSetDefaultAlamat(alamat.id_alamat)}
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ) : (
                <div className="text-center py-5 my-3 bg-light rounded border">
                  <div className="empty-address-illustration mb-3">
                    <FaMapMarkerAlt size={60} className="text-success opacity-50" />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Belum Ada Alamat Tersimpan</h5>
                  <p className="text-muted mb-4 px-4">
                    Anda belum menambahkan alamat pengiriman. Tambahkan alamat untuk memudahkan proses checkout saat berbelanja.
                  </p>
                  <button 
                    className="btn btn-success"
                    onClick={() => setShowAlamatForm(true)}
                  >
                    <MdAddLocation className="me-2" /> Tambah Alamat Sekarang
                  </button>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
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
                Halo, {profile?.data?.nama_pembeli || "Pengguna"}!
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