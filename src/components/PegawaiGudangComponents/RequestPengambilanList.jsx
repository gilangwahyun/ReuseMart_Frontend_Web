import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Alert, Card, Form, InputGroup } from "react-bootstrap";
import { FaSearch, FaCheck, FaCheckDouble } from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from "../../api";

const RequestPengambilanList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all request pengambilan data
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/request-pengambilan`);
      console.log("Request pengambilan data:", response.data);
      setRequests(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching request pengambilan data:", error);
      setError("Gagal memuat data request pengambilan: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending requests only
  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/request-pengambilan/pending`);
      console.log("Pending request pengambilan data:", response.data);
      setRequests(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching pending request pengambilan data:", error);
      setError("Gagal memuat data request pengambilan pending: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle approve request
  const handleApproveRequest = async (id) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/request-pengambilan/${id}/process`, {
        status: "Disetujui"
      });
      console.log("Approve response:", response.data);
      
      // Update the local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id ? { ...req, status: "Disetujui", tanggal_konfirmasi: new Date().toISOString() } : req
        )
      );
      
      setSuccessMessage(`Request pengambilan ID #${id} berhasil disetujui.`);
      
      // Refresh data
      setTimeout(() => {
        fetchRequests();
      }, 1000);
    } catch (error) {
      console.error("Error approving request:", error);
      setError("Gagal menyetujui request: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle complete request
  const handleCompleteRequest = async (id) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/request-pengambilan/${id}/complete`, {});
      console.log("Complete response:", response.data);
      
      // Update the local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id ? { ...req, status: "Selesai", tanggal_pengambilan: new Date().toISOString() } : req
        )
      );
      
      setSuccessMessage(`Request pengambilan ID #${id} berhasil diselesaikan.`);
      
      // Refresh data
      setTimeout(() => {
        fetchRequests();
      }, 1000);
    } catch (error) {
      console.error("Error completing request:", error);
      setError("Gagal menyelesaikan request: " + (error.response?.data?.message || error.message));
    }
  };

  // Filter requests based on search term
  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.id && request.id.toString().includes(searchLower)) ||
      (request.penitip?.nama_penitip && request.penitip.nama_penitip.toLowerCase().includes(searchLower)) ||
      (request.barang?.nama_barang && request.barang.nama_barang.toLowerCase().includes(searchLower)) ||
      (request.status && request.status.toLowerCase().includes(searchLower))
    );
  });

  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge bg="warning">Pending</Badge>;
      case "Disetujui":
        return <Badge bg="info">Disetujui</Badge>;
      case "Selesai":
        return <Badge bg="success">Selesai</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Daftar Request Pengambilan Barang</h2>

      {/* Success message */}
      {successMessage && (
        <Alert 
          variant="success" 
          className="mb-4" 
          dismissible 
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert 
          variant="danger" 
          className="mb-4" 
          dismissible 
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Filter controls */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Cari berdasarkan ID, nama penitip, atau barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end">
              <Button 
                variant="primary" 
                className="me-2"
                onClick={fetchRequests}
              >
                Semua Request
              </Button>
              <Button 
                variant="warning"
                onClick={fetchPendingRequests}
              >
                Request Pending
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Data table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat data...</span>
          </div>
          <p className="mt-2">Memuat data request pengambilan...</p>
        </div>
      ) : filteredRequests.length > 0 ? (
        <Card className="shadow-sm">
          <Table responsive striped hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Penitip</th>
                <th>Barang</th>
                <th>Tanggal Request</th>
                <th>Tanggal Pengambilan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>
                    {request.penitip?.nama_penitip || "-"}
                    {request.penitip?.no_telepon && (
                      <div><small className="text-muted">{request.penitip.no_telepon}</small></div>
                    )}
                  </td>
                  <td>
                    {request.barang?.nama_barang || "-"}
                    {request.barang?.kategori?.nama_kategori && (
                      <div><small className="text-muted">{request.barang.kategori.nama_kategori}</small></div>
                    )}
                  </td>
                  <td>{formatDate(request.tanggal_request)}</td>
                  <td>{formatDate(request.tanggal_pengambilan)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    {request.status === "Pending" && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        <FaCheck className="me-1" /> Setujui
                      </Button>
                    )}
                    {request.status === "Disetujui" && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleCompleteRequest(request.id)}
                      >
                        <FaCheckDouble className="me-1" /> Selesaikan
                      </Button>
                    )}
                    {request.status === "Selesai" && (
                      <span className="text-muted">Sudah selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="mb-0 text-muted">
              {searchTerm
                ? "Tidak ada request pengambilan yang sesuai dengan pencarian."
                : "Belum ada request pengambilan barang."}
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RequestPengambilanList; 