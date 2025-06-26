import { useEffect, useState } from "react";
import {
  getAllPenitip,
  getPenitipById,
  updatePenitip,
  deletePenitip,
  searchPenitipByName,
  registerPenitip
} from "../../api/PenitipApi";
import EditFormPenitip from "../../components/EditFormPenitip";
import RegisterFormPenitip from "../../components/RegisterFormPenitip";
import SidebarCRUDPenitip from "../../components/SidebarCRUDPenitip";
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert, InputGroup } from "react-bootstrap";

export default function PenitipPage() {
  const [penitipList, setPenitipList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [registerFormKey, setRegisterFormKey] = useState(Date.now());
  const [searchError, setSearchError] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  // Load all penitip data on initial render
  useEffect(() => {
    loadAllPenitip();
  }, []);

  // Handle search term changes with local filtering as a fallback
  useEffect(() => {
    // If no search term, show all data
    if (!searchTerm.trim()) {
      setFilteredList(penitipList);
      return;
    }

    // Simple client-side filtering as an immediate visual response
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const localFiltered = penitipList.filter(penitip => 
      penitip.nama_penitip && 
      penitip.nama_penitip.toLowerCase().includes(lowercaseSearchTerm)
    );
    
    setFilteredList(localFiltered);
    
    // Debounce the API search to avoid too many requests
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        performApiSearch(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, penitipList]);

  const loadAllPenitip = async () => {
    try {
      setLoading(true);
      const data = await getAllPenitip();
      setPenitipList(data);
      setFilteredList(data);
      setSearchError("");
    } catch (error) {
      console.error("Failed to load penitip data:", error);
      setSearchError("Gagal memuat data penitip");
    } finally {
      setLoading(false);
    }
  };

  const performApiSearch = async (term) => {
    if (searchLoading) return;
    setSearchLoading(true);
    setSearchError("");
    
    try {
      console.log("Searching for:", term);
      const results = await searchPenitipByName(term);
      console.log("Search results:", results);
      
      if (results && Array.isArray(results)) {
        setFilteredList(results);
      } else {
        console.error("Invalid search results format:", results);
        setSearchError("Format hasil pencarian tidak valid");
      }
    } catch (err) {
      console.error("Search API error:", err);
      setSearchError("Gagal melakukan pencarian");
      // We don't need to clear the list since we're already showing filtered results
    } finally {
      setSearchLoading(false);
    }
  };

  const handleShowDetail = async (id) => {
    try {
      const data = await getPenitipById(id);
      setSelected(data);
      setEditMode(false);
      setMessage("");
      setActiveTab("detail");
    } catch (error) {
      console.error("Error fetching penitip detail:", error);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setActiveTab("detail");
  };

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      const res = await updatePenitip(selected.id_penitip, formData);
      setMessage("Berhasil diupdate!");
      setEditMode(false);
      await loadAllPenitip();
      setSelected(res.data);
    } catch (err) {
      setMessage("Gagal update: " + (err.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus penitip ini? Akun pengguna yang terkait juga akan dihapus secara permanen.")) return;
    setLoading(true);
    try {
      await deletePenitip(id);
      setMessage("Penitip dan akun pengguna terkait berhasil dihapus!");
      setSelected(null);
      await loadAllPenitip();
      setActiveTab("list");
    } catch (err) {
      setMessage("Gagal hapus: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const handleRegister = async (formData) => {
    setRegisterLoading(true);
    setRegisterMessage("");
    
    try {
      // This will call registerPenitip which creates both User and Penitip records
      const response = await registerPenitip(formData);
      
      setRegisterMessage("Registrasi berhasil! User dan Penitip telah dibuat.");
      console.log("Registration successful:", response);
      
      // Refresh the penitip list
      await loadAllPenitip();
      
      // Reset the form
      setRegisterFormKey(Date.now());
      
      // Switch to list view after successful registration
      setActiveTab("list");
    } catch (err) {
      console.error("Registration error details:", err);
      
      // More detailed error handling
      let errorMessage = "Registrasi gagal. ";
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Laravel validation errors
        const validationErrors = err.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        errorMessage += firstError ? firstError[0] : "Validasi data gagal.";
      } else {
        errorMessage += "Periksa data dan coba lagi.";
      }
      
      setRegisterMessage(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setFilteredList(penitipList);
    setSearchError("");
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "register":
        return (
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-success text-white">
              Registrasi Penitip
            </Card.Header>
            <Card.Body>
              <RegisterFormPenitip key={registerFormKey} onSubmit={handleRegister} loading={registerLoading} />
              {registerMessage && (
                <Alert 
                  variant={registerMessage.includes("berhasil") ? "success" : "danger"} 
                  className="mt-3"
                >
                  {registerMessage}
                </Alert>
              )}
            </Card.Body>
          </Card>
        );

      case "detail":
        if (!selected) {
          return (
            <Alert variant="warning">
              Tidak ada penitip yang dipilih. Silakan pilih penitip dari daftar.
            </Alert>
          );
        }
        
        return editMode ? (
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-success">
              Edit Penitip
            </Card.Header>
            <Card.Body>
              <EditFormPenitip
                initialData={selected}
                onSubmit={handleUpdate}
                loading={loading}
              />
              
              {message && (
                <Alert 
                  variant={message.includes("Berhasil") ? "success" : "danger"} 
                  className="mt-3"
                >
                  {message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-success text-white">
              Detail Penitip
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}><strong>Nama:</strong></Col>
                <Col>{selected.nama_penitip}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>NIK:</strong></Col>
                <Col>{selected.nik}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>No Telepon:</strong></Col>
                <Col>{selected.no_telepon}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Alamat:</strong></Col>
                <Col>{selected.alamat}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Saldo:</strong></Col>
                <Col>{selected.saldo}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Jumlah Poin:</strong></Col>
                <Col>{selected.jumlah_poin}</Col>
              </Row>
              
              <Button variant="success" onClick={handleEdit} className="mt-3">
                Edit
              </Button>
              
              <Button 
                variant="danger" 
                onClick={() => handleDelete(selected.id_penitip)} 
                disabled={loading}
                className="mt-3 ms-2"
              >
                Hapus
              </Button>
              
              {message && (
                <Alert 
                  variant={message.includes("Berhasil") ? "success" : "danger"} 
                  className="mt-3"
                >
                  {message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        );

      case "list":
      default:
        return (
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-success text-white">
              Data Penitip
            </Card.Header>
            <Card.Body>
              <Form className="mb-3">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama penitip..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-success" 
                      onClick={handleResetSearch}
                    >
                      Reset
                    </Button>
                  )}
                </InputGroup>
                {searchLoading && (
                  <div className="text-center mt-2">
                    <small className="text-muted">Mencari...</small>
                  </div>
                )}
                {searchError && (
                  <Alert variant="danger" className="mt-2 py-1 px-2">
                    <small>{searchError}</small>
                  </Alert>
                )}
              </Form>

              <ListGroup>
                {filteredList.map((p) => (
                  <ListGroup.Item 
                    key={p.id_penitip} 
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{p.nama_penitip}</strong> - {p.nik}
                    </div>
                    <div>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => handleShowDetail(p.id_penitip)}
                      >
                        Detail
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(p.id_penitip)} 
                        disabled={loading}
                      >
                        Hapus
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              
              {filteredList.length === 0 && !searchLoading && (
                <Alert variant="light" className="text-center text-muted my-3">
                  {searchTerm ? "Tidak ada penitip dengan nama tersebut." : "Tidak ada data penitip."}
                </Alert>
              )}
            </Card.Body>
          </Card>
        );
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col lg={3} md={4} className="mb-4">
          <SidebarCRUDPenitip 
            activeKey={activeTab}
            onSelect={handleTabSelect}
            hasSelectedPenitip={selected !== null}
          />
        </Col>

        {/* Main Content */}
        <Col lg={9} md={8}>
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
}
