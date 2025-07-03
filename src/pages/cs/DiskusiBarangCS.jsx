import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CSSidebar from "../../components/CSSidebar";
import { getAllBarang, getBarangById, searchBarangByName } from "../../api/BarangApi";
import { getDiskusiByBarang, createDiskusi, getAllDiskusi } from "../../api/DiskusiApi";
import { FaSearch, FaUser, FaClock, FaReply, FaComments, FaList, FaBell } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiskusiBarangCS = () => {
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [diskusiList, setDiskusiList] = useState([]);
  const [allDiskusiList, setAllDiskusiList] = useState([]);
  const [unrepliedDiskusi, setUnrepliedDiskusi] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [newDiskusi, setNewDiskusi] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("barang"); // "barang" atau "unreplied"

  // Format tanggal untuk diskusi
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ambil data barang dan semua diskusi saat komponen dimuat
  useEffect(() => {
    fetchBarang();
    fetchAllDiskusi();
  }, []);

  // Filter diskusi yang belum dibalas saat data diskusi berubah
  useEffect(() => {
    filterUnrepliedDiskusi();
  }, [allDiskusiList]);

  // Ambil diskusi saat barang dipilih
  useEffect(() => {
    if (selectedBarang) {
      fetchDiskusi(selectedBarang.id_barang);
    }
  }, [selectedBarang]);

  // Fungsi untuk mengambil data barang
  const fetchBarang = async () => {
    setLoading(true);
    try {
      const response = await getAllBarang();
      setBarangList(response);
    } catch (error) {
      console.error("Error fetching barang:", error);
      toast.error("Gagal mengambil data barang");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil semua diskusi
  const fetchAllDiskusi = async () => {
    setLoading(true);
    try {
      const response = await getAllDiskusi();
      setAllDiskusiList(response);
    } catch (error) {
      console.error("Error fetching all diskusi:", error);
      toast.error("Gagal mengambil data semua diskusi");
    } finally {
      setLoading(false);
    }
  };

  // Filter diskusi yang belum dibalas oleh CS
  const filterUnrepliedDiskusi = () => {
    // Kelompokkan diskusi berdasarkan barang
    const diskusiByBarang = {};
    
    allDiskusiList.forEach(diskusi => {
      if (!diskusi.komen.startsWith('[CS]') && !diskusi.komen.startsWith('[Balasan')) {
        // Ini adalah diskusi dari pembeli yang belum dibalas
        const idBarang = diskusi.id_barang;
        
        // Cek apakah ada balasan CS untuk diskusi ini
        const hasReply = allDiskusiList.some(reply => 
          (reply.komen.startsWith('[CS]') || reply.komen.startsWith('[Balasan')) && 
          reply.id_barang === idBarang
        );
        
        if (!hasReply) {
          if (!diskusiByBarang[idBarang]) {
            diskusiByBarang[idBarang] = [];
          }
          diskusiByBarang[idBarang].push(diskusi);
        }
      }
    });
    
    // Flatten dan urutkan berdasarkan tanggal terbaru
    const unrepliedList = Object.values(diskusiByBarang)
      .flat()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setUnrepliedDiskusi(unrepliedList);
  };

  // Fungsi untuk mengambil diskusi berdasarkan ID barang
  const fetchDiskusi = async (idBarang) => {
    setLoading(true);
    try {
      const response = await getDiskusiByBarang(idBarang);
      setDiskusiList(response);
    } catch (error) {
      console.error("Error fetching diskusi:", error);
      toast.error("Gagal mengambil data diskusi");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mencari barang
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBarang();
      return;
    }
    
    setLoading(true);
    try {
      const response = await searchBarangByName(searchQuery);
      setBarangList(response);
    } catch (error) {
      console.error("Error searching barang:", error);
      toast.error("Gagal mencari barang");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memilih barang
  const handleSelectBarang = async (barang) => {
    setSelectedBarang(barang);
    setReplyingTo(null);
    setReplyContent("");
    setNewDiskusi("");
    setActiveTab("barang");
  };

  // Fungsi untuk memulai balasan
  const handleStartReply = (diskusi) => {
    setReplyingTo(diskusi);
    setReplyContent("");
  };

  // Fungsi untuk membatalkan balasan
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  // Fungsi untuk mengirim balasan
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      // Ambil data user CS dari localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id_user) {
        toast.error("Data pengguna tidak ditemukan, silakan login kembali");
        return;
      }

      const diskusiData = {
        id_barang: activeTab === "barang" ? selectedBarang.id_barang : replyingTo.id_barang,
        id_user: userData.id_user,
        komen: `[Balasan untuk ${replyingTo.user?.pembeli?.nama_pembeli || "Pengguna"}]: ${replyContent.trim()}`,
      };
      
      await createDiskusi(diskusiData);
      
      // Refresh diskusi list
      if (activeTab === "barang") {
        await fetchDiskusi(selectedBarang.id_barang);
      }
      
      // Refresh semua diskusi untuk memperbarui daftar yang belum dibalas
      await fetchAllDiskusi();
      
      setReplyingTo(null);
      setReplyContent("");
      toast.success("Balasan berhasil ditambahkan");
    } catch (err) {
      console.error("Error adding reply:", err);
      toast.error("Gagal menambahkan balasan: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Fungsi untuk mengirim diskusi baru
  const handleSubmitDiskusi = async (e) => {
    e.preventDefault();
    if (!newDiskusi.trim()) return;

    setSubmitting(true);
    try {
      // Ambil data user CS dari localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id_user) {
        toast.error("Data pengguna tidak ditemukan, silakan login kembali");
        return;
      }

      const diskusiData = {
        id_barang: selectedBarang.id_barang,
        id_user: userData.id_user,
        komen: `[CS]: ${newDiskusi.trim()}`,
      };
      
      await createDiskusi(diskusiData);
      
      // Refresh diskusi list
      await fetchDiskusi(selectedBarang.id_barang);
      
      // Refresh semua diskusi
      await fetchAllDiskusi();
      
      setNewDiskusi("");
      toast.success("Diskusi berhasil ditambahkan");
    } catch (err) {
      console.error("Error adding diskusi:", err);
      toast.error("Gagal menambahkan diskusi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBarang = barangList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="d-flex">
      <CSSidebar />
      <div className="p-4 w-100">
        <ToastContainer />
        <h3 className="mb-4">Manajemen Diskusi Barang</h3>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "barang" ? "active" : ""}`}
              onClick={() => setActiveTab("barang")}
              style={{ 
                color: activeTab === "barang" ? "#198754" : "#212529",
                fontWeight: activeTab === "barang" ? "600" : "400",
                borderBottom: activeTab === "barang" ? "3px solid #198754" : "none"
              }}
            >
              <FaList className="me-2" /> Daftar Barang
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "unreplied" ? "active" : ""}`}
              onClick={() => setActiveTab("unreplied")}
              style={{ 
                color: activeTab === "unreplied" ? "#198754" : "#212529",
                fontWeight: activeTab === "unreplied" ? "600" : "400",
                borderBottom: activeTab === "unreplied" ? "3px solid #198754" : "none"
              }}
            >
              <FaBell className="me-2" /> Diskusi Belum Dibalas 
              {unrepliedDiskusi.length > 0 && (
                <span className="badge bg-danger ms-2">{unrepliedDiskusi.length}</span>
              )}
            </button>
          </li>
        </ul>

        {activeTab === "barang" ? (
          <div className="row">
            {/* Daftar Barang */}
            <div className="col-md-5">
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Daftar Barang</h5>
                </div>
                <div className="card-body">
                  {/* Search Bar */}
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari barang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-outline-success" type="button" onClick={handleSearch}>
                      <FaSearch />
                    </button>
                  </div>

                  {/* Daftar Barang */}
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="list-group">
                      {currentBarang.length > 0 ? (
                        currentBarang.map((barang) => (
                          <button
                            key={barang.id_barang}
                            className={`list-group-item list-group-item-action ${
                              selectedBarang?.id_barang === barang.id_barang ? "active bg-success" : ""
                            }`}
                            onClick={() => handleSelectBarang(barang)}
                          >
                            <div className="d-flex w-100 justify-content-between">
                              <h6 className="mb-1">{barang.nama_barang}</h6>
                              <small>ID: {barang.id_barang}</small>
                            </div>
                            <p className="mb-1 text-truncate">{barang.deskripsi}</p>
                            <small>Harga: Rp {barang.harga.toLocaleString('id-ID')}</small>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-muted mb-0">Tidak ada barang ditemukan</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {barangList.length > itemsPerPage && (
                    <nav className="mt-3">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                          <button className="page-link" onClick={() => paginate(currentPage - 1)}
                            style={{ color: "#198754", borderColor: "#dee2e6" }}>
                            &laquo;
                          </button>
                        </li>
                        {Array.from({ length: Math.ceil(barangList.length / itemsPerPage) }).map((_, index) => (
                          <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(index + 1)}
                              style={{ 
                                backgroundColor: currentPage === index + 1 ? "#198754" : "",
                                borderColor: currentPage === index + 1 ? "#198754" : "#dee2e6",
                                color: currentPage === index + 1 ? "#fff" : "#198754"
                              }}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            currentPage === Math.ceil(barangList.length / itemsPerPage) ? "disabled" : ""
                          }`}
                        >
                          <button className="page-link" onClick={() => paginate(currentPage + 1)}
                            style={{ color: "#198754", borderColor: "#dee2e6" }}>
                            &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            </div>

            {/* Diskusi Barang */}
            <div className="col-md-7">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    {selectedBarang
                      ? `Diskusi: ${selectedBarang.nama_barang}`
                      : "Pilih barang untuk melihat diskusi"}
                  </h5>
                </div>
                <div className="card-body">
                  {selectedBarang ? (
                    <>
                      {/* Form Tambah Diskusi Baru */}
                      <form onSubmit={handleSubmitDiskusi} className="mb-4">
                        <div className="mb-3">
                          <label htmlFor="newDiskusi" className="form-label">
                            Tambah Diskusi Baru sebagai CS
                          </label>
                          <textarea
                            id="newDiskusi"
                            className="form-control"
                            rows="3"
                            placeholder="Tulis diskusi baru..."
                            value={newDiskusi}
                            onChange={(e) => setNewDiskusi(e.target.value)}
                            disabled={submitting}
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={submitting || !newDiskusi.trim()}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Mengirim...
                            </>
                          ) : (
                            'Kirim Diskusi'
                          )}
                        </button>
                      </form>

                      {/* Daftar Diskusi */}
                      {loading ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : diskusiList.length > 0 ? (
                        <div className="list-group">
                          {diskusiList.map((item) => (
                            <div key={item.id_diskusi} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center">
                                  <FaUser className="text-secondary me-2" />
                                  <strong>
                                    {item.komen.startsWith('[CS]') || item.komen.startsWith('[Balasan') ? (
                                      <>
                                        {item.user?.pegawai?.nama_pegawai || "CS ReuseMart"}
                                        <span className="badge bg-success ms-2">CS</span>
                                      </>
                                    ) : (
                                      item.user?.pembeli?.nama_pembeli || "Pengguna"
                                    )}
                                  </strong>
                                </div>
                                <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
                                  <FaClock className="me-1" />
                                  {item.formatted_created_at || formatDate(item.created_at)}
                                </div>
                              </div>
                              <p className="mb-2">{item.komen}</p>
                              
                              {/* Tombol Reply */}
                              {!item.komen.startsWith('[CS]') && !item.komen.startsWith('[Balasan') && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleStartReply(item)}
                                >
                                  <FaReply className="me-1" /> Balas
                                </button>
                              )}

                              {/* Form Reply */}
                              {replyingTo && replyingTo.id_diskusi === item.id_diskusi && (
                                <form onSubmit={handleSubmitReply} className="mt-3">
                                  <div className="mb-3">
                                    <textarea
                                      className="form-control"
                                      rows="2"
                                      placeholder={`Balas ke ${item.user?.pembeli?.nama_pembeli || "Pengguna"}...`}
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      disabled={submitting}
                                    ></textarea>
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button
                                      type="submit"
                                      className="btn btn-sm btn-success"
                                      disabled={submitting || !replyContent.trim()}
                                    >
                                      {submitting ? "Mengirim..." : "Kirim Balasan"}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={handleCancelReply}
                                      disabled={submitting}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted mb-0">Belum ada diskusi untuk barang ini.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted mb-0">Silakan pilih barang terlebih dahulu untuk melihat diskusi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab Diskusi Belum Dibalas */
          <div className="card">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Diskusi Belum Dibalas</h5>
              <button 
                className="btn btn-sm btn-light" 
                onClick={fetchAllDiskusi}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                ) : (
                  <FaComments className="me-1" />
                )}
                Refresh
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : unrepliedDiskusi.length > 0 ? (
                <div className="list-group">
                  {unrepliedDiskusi.map((item) => (
                    <div key={item.id_diskusi} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <FaUser className="text-secondary me-2" />
                          <strong>{item.user?.pembeli?.nama_pembeli || "Pengguna"}</strong>
                        </div>
                        <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
                          <FaClock className="me-1" />
                          {item.formatted_created_at || formatDate(item.created_at)}
                        </div>
                      </div>
                      <h6 className="mb-1">
                        <Link to={`/product/${item.id_barang}`} target="_blank" className="text-decoration-none">
                          {item.barang?.nama_barang || `Barang #${item.id_barang}`}
                        </Link>
                      </h6>
                      <p className="mb-2">{item.komen}</p>
                      
                      {/* Tombol Reply */}
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleStartReply(item)}
                      >
                        <FaReply className="me-1" /> Balas
                      </button>

                      {/* Form Reply */}
                      {replyingTo && replyingTo.id_diskusi === item.id_diskusi && (
                        <form onSubmit={handleSubmitReply} className="mt-3">
                          <div className="mb-3">
                            <textarea
                              className="form-control"
                              rows="2"
                              placeholder={`Balas ke ${item.user?.pembeli?.nama_pembeli || "Pengguna"}...`}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              disabled={submitting}
                            ></textarea>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="submit"
                              className="btn btn-sm btn-success"
                              disabled={submitting || !replyContent.trim()}
                            >
                              {submitting ? "Mengirim..." : "Kirim Balasan"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleCancelReply}
                              disabled={submitting}
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">Tidak ada diskusi yang belum dibalas.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiskusiBarangCS; 