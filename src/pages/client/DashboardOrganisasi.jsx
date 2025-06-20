import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Alert, Image } from 'react-bootstrap';
import {
  createRequestDonasi,
  getRequestDonasiByOrganisasi,
  updateRequestDonasiByOrganisasi,
  deleteRequestDonasiByOrganisasi,
  createRequestDonasiByOrganisasi,
} from '../../api/RequestDonasiApi';
import { getOrganisasi } from '../../api/OrganisasiApi';
import { useNavigate } from 'react-router-dom';
import ListRequestDonasi from '../../components/ListRequestDonasi';
import BuatRequestDonasi from '../../components/BuatRequestDonasi';
import HorizontalNavOrganisasi from '../../components/HorizontalNavOrganisasi';
import { FaUser, FaMapMarkerAlt, FaPhoneAlt, FaInfoCircle, FaCalendarAlt, FaClipboardList, FaPlus, FaUserCircle, FaChartBar, FaTimes, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { Nav, Spinner } from 'react-bootstrap';

const DashboardOrganisasi = () => {
  const [organisasi, setOrganisasi] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Safely get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  const user = getUserData();
  const id_user = user?.id_user;

  // Ambil data organisasi user login
  const fetchOrganisasi = async () => {
    try {
      const allOrgs = await getOrganisasi();
      if (!Array.isArray(allOrgs)) {
        console.error("Invalid response from getOrganisasi:", allOrgs);
        return null;
      }
      return allOrgs.find(o => o.id_user === id_user) || null;
    } catch (err) {
      console.error("Error fetching organisasi:", err);
      throw err;
    }
  };

  // Ambil request donasi milik organisasi user login
  const fetchRequests = async (id_organisasi) => {
    try {
      const res = await getRequestDonasiByOrganisasi(id_organisasi);
      // Handle different response formats
      const data = res?.data || res || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error fetching requests:", err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // Check if user exists
      if (!id_user) {
        setError('Pengguna tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      try {
        const org = await fetchOrganisasi();
        setOrganisasi(org);

        if (!org) {
          setError('Organisasi tidak ditemukan untuk pengguna ini.');
          setLoading(false);
          return;
        }

        const requestsData = await fetchRequests(org.id_organisasi);
        setRequests(requestsData);
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError('Gagal memuat data. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_user]);

  const handleCreate = async (data) => {
    try {
      if (!organisasi || !organisasi.id_organisasi) {
        alert('Data organisasi tidak lengkap.');
        return;
      }
      
      await createRequestDonasiByOrganisasi(organisasi.id_organisasi, data);
      
      // Refresh data
      const filteredRequests = await fetchRequests(organisasi.id_organisasi);
      setRequests(filteredRequests);
      setActiveTab('list-request');
    } catch (err) {
      console.error("Error creating request:", err);
      alert('Gagal membuat request donasi. Silakan coba lagi.');
    }
  };

  const handleDelete = async (id) => {
    if (!id || !organisasi?.id_organisasi) {
      alert('Data tidak lengkap untuk menghapus request.');
      return;
    }
    
    if (window.confirm('Yakin ingin menghapus request donasi ini?')) {
      try {
        await deleteRequestDonasiByOrganisasi(organisasi.id_organisasi, id);
        
        // Refresh data
        const filteredRequests = await fetchRequests(organisasi.id_organisasi);
        setRequests(filteredRequests);
      } catch (err) {
        console.error("Error deleting request:", err);
        alert('Gagal menghapus request donasi. Silakan coba lagi.');
      }
    }
  };

  const handleEdit = async (id, data) => {
    if (!id || !data || !organisasi?.id_organisasi) {
      alert('Data tidak lengkap untuk mengedit request.');
      return;
    }
    
    try {
      await updateRequestDonasiByOrganisasi(organisasi.id_organisasi, id, data);
      
      // Refresh data
      const filteredRequests = await fetchRequests(organisasi.id_organisasi);
      setRequests(filteredRequests);
    } catch (err) {
      console.error("Error updating request:", err);
      alert('Gagal mengedit request donasi. Silakan coba lagi.');
    }
  };

  // Update the filter logic to include status filtering
  const filteredRequests = requests.filter(r => {
    // First filter by search term
    const matchesSearch = r?.deskripsi?.toLowerCase().includes(search.toLowerCase());
    
    // Then filter by status if not "all"
    const matchesStatus = statusFilter === 'all' || r?.status_pengajuan === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Sedang memuat data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="danger" className="my-3 shadow-sm">
          <h5 className="mb-2">Terjadi Kesalahan</h5>
          <p className="mb-0">{error}</p>
        </Alert>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <Card className="shadow-sm mb-4 border-0">
            <Card.Header className="bg-success text-white py-3">
              <h5 className="mb-0">Profil Organisasi</h5>
            </Card.Header>
            
            {organisasi ? (
              <>
                <div className="bg-light text-center py-4 border-bottom">
                  <div className="mb-3">
                    <div className="mx-auto rounded-circle bg-success d-flex align-items-center justify-content-center" 
                         style={{width: '100px', height: '100px'}}>
                      <FaUser size={40} className="text-white" />
                    </div>
                  </div>
                  <h4 className="mb-1">{organisasi.nama_organisasi || 'Nama Organisasi'}</h4>
                  <p className="text-muted mb-0">
                    <FaCalendarAlt className="me-1" /> 
                    Bergabung: {organisasi.tanggal_bergabung || 'N/A'}
                  </p>
                </div>
                
                <Card.Body className="p-4">
                  <Row>
                    <Col md={6} className="mb-3">
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <h6 className="text-uppercase text-muted mb-3">
                            <FaMapMarkerAlt className="me-2" />Alamat
                          </h6>
                          <p className="mb-0 fs-5">{organisasi.alamat || 'Belum ada informasi alamat'}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6} className="mb-3">
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <h6 className="text-uppercase text-muted mb-3">
                            <FaPhoneAlt className="me-2" />Kontak
                          </h6>
                          <p className="mb-0 fs-5">{organisasi.no_telepon || 'Belum ada informasi kontak'}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={12}>
                      <Card className="border-0 shadow-sm">
                        <Card.Body>
                          <h6 className="text-uppercase text-muted mb-3">
                            <FaInfoCircle className="me-2" />Deskripsi
                          </h6>
                          <p className="mb-0">
                            {organisasi.deskripsi || 'Belum ada informasi deskripsi organisasi'}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </>
            ) : (
              <Card.Body className="text-center py-5">
                <FaUser size={48} className="text-muted mb-3" />
                <p className="mb-0">Data organisasi tidak tersedia.</p>
              </Card.Body>
            )}
          </Card>
        );
      case 'list-request':
        return (
          <>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-success text-white py-3">
                <h5 className="mb-0">Filter Request Donasi</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Cari deskripsi request donasi..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Select 
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Semua Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Sudah Disetujui">Sudah Disetujui</option>
                        <option value="Ditolak">Ditolak</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            <ListRequestDonasi
              requests={filteredRequests}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </>
        );
      case 'create-request':
        return <BuatRequestDonasi onCreate={handleCreate} />;
      case 'statistics':
        return (
          <Card className="shadow-sm mb-4 border-0">
            <Card.Header className="bg-success text-white py-3">
              <h5 className="mb-0">Statistik Donasi</h5>
            </Card.Header>
            <Card.Body className="py-5 text-center">
              <FaChartBar size={48} className="text-success mb-3 opacity-50" />
              <h5 className="mb-2">Fitur Statistik Donasi</h5>
              <p className="text-muted mb-0">Fitur statistik donasi akan segera hadir!</p>
            </Card.Body>
          </Card>
        );
      default:
        return <Alert variant="info">Silakan pilih menu di atas</Alert>;
    }
  };

  // Summary data for the organization dashboard
  const getDashboardSummary = () => {
    if (!organisasi || !requests) return null;
    
    // Calculate statistics
    const pendingRequests = requests.filter(r => r?.status_pengajuan === 'Pending').length;
    const approvedRequests = requests.filter(r => r?.status_pengajuan === 'Sudah Disetujui').length;
    const rejectedRequests = requests.filter(r => r?.status_pengajuan === 'Ditolak').length;
    
    return (
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <FaClipboardList className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Request</h6>
                <h3 className="mb-0">{requests.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <FaPlus className="text-success" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Sudah Disetujui</h6>
                <h3 className="mb-0">{approvedRequests}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <FaUser className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Pending</h6>
                <h3 className="mb-0">{pendingRequests}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-5 px-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Sedang memuat data organisasi...</p>
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
                {organisasi?.nama_organisasi || "Organisasi"}
              </h3>
              <p className="mb-0 opacity-75">
                Dashboard Organisasi ReuseMart
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Nav horizontal di atas */}
        <HorizontalNavOrganisasi
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
        />

        {/* Dashboard Summary */}
        {getDashboardSummary()}
        
        {/* Konten utama */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </Container>
    </Container>
  );
};

export default DashboardOrganisasi;
