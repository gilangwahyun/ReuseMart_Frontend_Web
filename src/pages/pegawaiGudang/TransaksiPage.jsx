import React, { useState, useEffect } from "react";
import { Button, Badge, Alert, Modal, Form, Spinner, Card, Row, Col } from "react-bootstrap";
import useAxios, { BASE_URL } from "../../api"; // Import the configured axios instance with BASE_URL
import { useNavigate } from "react-router-dom";
import { getAllPegawai } from "../../api/PegawaiApi";
import { createJadwal } from "../../api/JadwalApi";
import TransaksiTable from "../../components/PegawaiGudangComponents/TransaksiTable"; // Import komponen tabel
import PegawaiGudangSidebar from "../../components/PegawaiGudangSidebar";
import { getFotoBarangByIdBarang } from "../../api/fotoBarangApi"; // Import API untuk foto barang

const TransaksiPage = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showOnlyUnscheduled, setShowOnlyUnscheduled] = useState(false);
  const navigate = useNavigate();
  
  // States untuk filter pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState({
    status_transaksi: '',
    metode_pengiriman: '',
    tanggalAwal: '',
    tanggalAkhir: '',
    harga_min: '',
    harga_max: '',
  });
  
  // States for jadwal creation
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [jadwalData, setJadwalData] = useState({
    id_transaksi: "",
    id_pegawai: "",
    tanggal: "",
    status_jadwal: "Sedang Dikirim"
  });
  const [jadwalLoading, setJadwalLoading] = useState(false);
  const [jadwalError, setJadwalError] = useState(null);
  const [jadwalSuccess, setJadwalSuccess] = useState(null);
  const [isDeliveryByCourier, setIsDeliveryByCourier] = useState(true);
  const [timeError, setTimeError] = useState(null);
  
  // States for transaction detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  
  // State to track which transactions already have jadwal
  const [transactionWithJadwal, setTransactionWithJadwal] = useState([]);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      setError("Anda harus login untuk mengakses halaman ini");
      return;
    }

    // Add this to verify and debug the token
    console.log("Current token:", token.substring(0, 15) + "...");
    
    // Check if the token format looks valid
    if (!token.includes(".")) { 
      console.warn("Token format doesn't appear to be valid JWT");
    }

    fetchTransaksi();
    fetchJadwalData();
  }, []);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Attempting to fetch transactions...");
      
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Accept': 'application/json'
      };
      
      const response = await useAxios.get("/transaksi", { headers });
      console.log("Transaksi API response:", response.data);
      let transaksiData = Array.isArray(response.data) ? response.data : (response.data.data || []);

      // Ambil nama barang untuk setiap transaksi
      const transaksiWithNamaBarang = await Promise.all(
        transaksiData.map(async (trx) => {
          try {
            // Ambil detail transaksi (bisa berisi banyak barang)
            const detailResponse = await useAxios.get(`/detailTransaksi/transaksi/${trx.id_transaksi}`);
            console.log(`Detail for transaksi ${trx.id_transaksi}:`, detailResponse.data);
            // Periksa struktur response dan dapatkan array detail yang benar
            const detailItems = detailResponse.data.data || detailResponse.data || [];
            
            // Gabungkan nama barang (jika lebih dari satu, pisahkan dengan koma)
            let namaBarang = "-";
            if (Array.isArray(detailItems) && detailItems.length > 0) {
              // Extract nama barang langsung dari detailItems jika ada
              const barangNames = detailItems.map(item => {
                // Periksa struktur barang dan dapatkan nama dengan aman
                const name = item.barang?.nama_barang || 
                      (item.barang ? `Barang #${item.id_barang}` : `Barang #${item.id_barang}`);
                console.log(`Barang name extracted: ${name} for item:`, item);
                return name;
              });
              namaBarang = barangNames.join(", ");
            }
            console.log(`Final nama_barang for transaksi ${trx.id_transaksi}:`, namaBarang);
            return { ...trx, nama_barang: namaBarang };
          } catch (err) {
            console.error(`Error fetching detail for transaction ${trx.id_transaksi}:`, err);
            return { ...trx, nama_barang: "-" };
          }
        })
      );

      console.log("Final transaksi data with nama_barang:", transaksiWithNamaBarang);
      setTransaksi(transaksiWithNamaBarang);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
      
      // More detailed error reporting
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        
        if (error.response.status === 401) {
          setIsAuthenticated(false);
          setError("Sesi Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => navigate("/LoginPage"), 2000);
        } else {
          setError(`Gagal memuat data transaksi (${error.response.status}): ${error.response.data?.message || "Silakan coba lagi nanti."}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("Server tidak merespon. Periksa koneksi internet Anda atau coba lagi nanti.");
      } else {
        console.error("Error message:", error.message);
        setError(`Gagal memuat data: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  // Fetch all jadwal data to know which transactions already have jadwal
  const fetchJadwalData = async () => {
    try {
      const response = await useAxios.get("/jadwal");
      // Extract transaction IDs that already have jadwal
      const transactionIds = response.data.map(jadwal => jadwal.id_transaksi);
      setTransactionWithJadwal(transactionIds);
    } catch (error) {
      console.error("Error fetching jadwal data:", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await useAxios.put(`/transaksi/${id}`, { status_transaksi: newStatus });
      fetchTransaksi(); // Refresh data after update
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.status === 401) {
        setIsAuthenticated(false);
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/LoginPage"), 2000);
      } else {
        setError("Gagal mengubah status transaksi. Silakan coba lagi nanti.");
      }
    }
  };

  // Function to fetch transaction details
  const fetchTransactionDetail = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetailItems([]); // Reset items terlebih dahulu
    try {
      // Fetch transaction details
      const transaksiResponse = await useAxios.get(`/transaksi/${id}`);
      console.log(`Transaction ${id} details:`, transaksiResponse.data);
      const transaksiData = transaksiResponse.data?.data || transaksiResponse.data;
      setDetailTransaksi(transaksiData);
      
      // Fetch items in this transaction
      const detailResponse = await useAxios.get(`/detailTransaksi/transaksi/${id}`);
      console.log(`Detail items response for transaction ${id}:`, detailResponse.data);
      
      // Pastikan kita mendapatkan array detail yang benar dari respons API
      let items = [];
      if (detailResponse.data?.data && Array.isArray(detailResponse.data.data)) {
        items = detailResponse.data.data;
      } else if (Array.isArray(detailResponse.data)) {
        items = detailResponse.data;
      }
      
      console.log("Detail items extracted:", items);
      
      if (!items || items.length === 0) {
        console.warn("No detail items found for transaction", id);
        setDetailItems([]);
        setDetailLoading(false);
        return;
      }
      
      // Placeholder image - base64 encoded small gray image with product icon
      const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSI+PHBhdGggZD0iTTE2LjUgOS40bC05LTVWMjFsOSA1VjkuNHoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxNi41IDMuNSA3LjUgOC41IDE2LjUgMTMuNSI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=";
      
      // Fetch item details and images
      const processedItems = [];
      
      for (const item of items) {
        try {
          // Gunakan data barang yang sudah di-include oleh API
          const barang = item.barang || {};
          console.log(`Barang data for item ${item.id_barang}:`, barang);
          
          // Ambil foto barang menggunakan API khusus foto
          let imageUrl = placeholderImage;
          try {
            // Dapatkan semua foto untuk barang ini
            const fotos = await getFotoBarangByIdBarang(item.id_barang);
            console.log(`Fotos for item ${item.id_barang}:`, fotos);
            
            if (fotos && fotos.length > 0) {
              // Pilih foto dengan is_thumbnail === true
              const thumbnail = fotos.find(f => f.is_thumbnail);
              if (thumbnail) {
                imageUrl = `${BASE_URL}/${thumbnail.url_foto}`;
              } else {
                // Fallback ke foto pertama (id_foto_barang terkecil)
                const sortedFotos = fotos.sort((a, b) => a.id_foto_barang - b.id_foto_barang);
                if (sortedFotos[0] && sortedFotos[0].url_foto) {
                  imageUrl = `${BASE_URL}/${sortedFotos[0].url_foto}`;
                }
              }
              console.log(`Found image URL for item ${item.id_barang}:`, imageUrl);
            }
          } catch (err) {
            console.error(`Error fetching foto for item ${item.id_barang}:`, err);
          }
          
          const processedItem = {
            id_detail_transaksi: item.id_detail_transaksi,
            id_barang: item.id_barang,
            id_transaksi: item.id_transaksi,
            harga_item: item.harga_item || 0,
            jumlah: item.jumlah || 1,
            barang: barang,
            imageUrl: imageUrl,
            namaBarang: barang?.nama_barang || `Barang #${item.id_barang}`
          };
          
          console.log(`Processed item:`, processedItem);
          processedItems.push(processedItem);
        } catch (err) {
          console.error(`Error processing item:`, err);
        }
      }
      
      console.log("All processed items:", processedItems);
      setDetailItems(processedItems);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setDetailError("Gagal memuat detail transaksi. Silakan coba lagi nanti.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetailModal = async (transaksi) => {
    setShowDetailModal(true);
    await fetchTransactionDetail(transaksi.id_transaksi);
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return <Badge bg="secondary">Tidak Ada</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "proses":
        return <Badge bg="info">Proses</Badge>;
      case "selesai":
        return <Badge bg="success">Selesai</Badge>;
      case "dibatalkan":
        return <Badge bg="danger">Dibatalkan</Badge>;
      case "lunas":
        return <Badge bg="success">Lunas</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Helper to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Function to check if current time is past 4 PM
  const isPastDeadline = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 16; // 16 is 4 PM in 24-hour format
  };

  // Function to get minimum allowed delivery date based on time
  const getMinDeliveryDate = () => {
    const today = new Date();
    // If past 4 PM, minimum date is tomorrow for couriers
    if (isPastDeadline()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    // Otherwise, today is fine
    return today.toISOString().split('T')[0];
  };

  // For any delivery method, don't allow dates in the past
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Function to open jadwal modal
  const openJadwalModal = (transaksi) => {
    setTimeError(null);
    setSelectedTransaksi(transaksi);
    
    // Check shipping method - defaults
    const isCourierDelivery = transaksi.metode_pengiriman === "Dikirim oleh Kurir";
    setIsDeliveryByCourier(isCourierDelivery);
    
    const defaultStatus = isCourierDelivery ? "Sedang Dikirim" : "Menunggu Diambil";
    
    // Set appropriate date based on time
    const minDeliveryDate = getMinDeliveryDate();

    // Show a warning if it's past 4 PM and courier delivery
    if (isCourierDelivery && isPastDeadline()) {
      setTimeError(
        "Pengiriman kurir setelah jam 16:00 akan dijadwalkan untuk besok."
      );
    }
    
    setJadwalData({
      id_transaksi: transaksi.id_transaksi,
      id_pegawai: "", // Reset courier selection
      tanggal: minDeliveryDate,
      status_jadwal: defaultStatus
    });
    
    // Fetch pegawai list only if courier delivery
    if (isCourierDelivery) {
      fetchPegawaiList();
    }
    
    setShowJadwalModal(true);
  };

  // Function to fetch pegawai list
  const fetchPegawaiList = async () => {
    try {
      const response = await getAllPegawai();
      // Filter pegawai who have id_jabatan = 6 (courier)
      const couriers = response.data?.filter(pegawai => 
        pegawai.id_jabatan === 6
      ) || [];
      setPegawaiList(couriers);
    } catch (error) {
      console.error("Error fetching pegawai:", error);
      setJadwalError("Gagal memuat data kurir. Silakan coba lagi nanti.");
    }
  };

  // Handle jadwal form input changes
  const handleJadwalInputChange = (e) => {
    const { name, value } = e.target;
    setJadwalData({
      ...jadwalData,
      [name]: value
    });
  };

  // Submit jadwal form
  const handleSubmitJadwal = async (e) => {
    e.preventDefault();
    setJadwalLoading(true);
    setJadwalError(null);
    
    try {
      // Validate delivery date for courier deliveries
      if (isDeliveryByCourier && isPastDeadline()) {
        const minAllowedDate = getMinDeliveryDate();
        const selectedDate = jadwalData.tanggal;
        
        if (selectedDate < minAllowedDate) {
          throw new Error("Untuk pengiriman kurir setelah jam 16:00, tanggal pengiriman harus besok atau lebih lambat.");
        }
      }

      // Prepare data based on delivery method
      const formattedData = {
        id_transaksi: jadwalData.id_transaksi,
        tanggal: jadwalData.tanggal,
        status_jadwal: jadwalData.status_jadwal,
        id_pegawai: null // Default to null for all cases
      };
      
      // Override with actual pegawai ID if courier delivery
      if (isDeliveryByCourier) {
        if (!jadwalData.id_pegawai) {
          throw new Error("Kurir harus dipilih untuk pengiriman oleh kurir");
        }
        formattedData.id_pegawai = jadwalData.id_pegawai;
      }
      
      console.log('Submitting jadwal data:', formattedData);
      
      const response = await createJadwal(formattedData);
      console.log('Jadwal creation response:', response);
      
      // Customize success message based on delivery method
      if (isDeliveryByCourier) {
        setJadwalSuccess("Jadwal pengiriman berhasil dibuat! Notifikasi telah dikirim ke kurir, pembeli, dan pemilik barang.");
      } else {
        setJadwalSuccess("Jadwal pengambilan berhasil dibuat! Notifikasi telah dikirim ke pembeli dan pemilik barang.");
      }
      
      // Update UI
      fetchTransaksi();
      fetchJadwalData();
      
      // Clear form and close modal after short delay
      setTimeout(() => {
        setShowJadwalModal(false);
        setJadwalSuccess(null);
        setJadwalData({
          id_transaksi: "",
          id_pegawai: "",
          tanggal: new Date().toISOString().split('T')[0],
          status_jadwal: "Sedang Dikirim"
        });
      }, 2500); // Increase timeout slightly to give more time to read the notification message
    } catch (error) {
      console.error("Error creating jadwal:", error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      setJadwalError("Gagal membuat jadwal pengiriman: " + 
        (error.response?.data?.message || error.message));
    } finally {
      setJadwalLoading(false);
    }
  };

  // Function to check if transaction already has jadwal
  const hasJadwal = (transactionId) => {
    return transactionWithJadwal.includes(transactionId);
  };

  // Function to filter transactions based on filter state
  const filteredTransaksi = () => {
    if (!showOnlyUnscheduled) return transaksi;
    return transaksi.filter(item => !hasJadwal(item.id_transaksi));
  };

  // Function to check if we can create jadwal for a transaction
  const canCreateJadwal = (transaction) => {
    // Already has a jadwal
    if (hasJadwal(transaction.id_transaksi)) {
      return false;
    }

    return true;
  };

  // Function to get button tooltip based on transaction status
  const getJadwalButtonTooltip = (transaction) => {
    if (hasJadwal(transaction.id_transaksi)) {
      return "Jadwal sudah dibuat";
    }
    
    if (transaction.metode_pengiriman === "Dikirim oleh Kurir" && isPastDeadline()) {
      return "Jadwal pengiriman kurir setelah jam 16:00 akan dijadwalkan untuk besok";
    }
    
    return "Buat jadwal pengiriman";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filter
  const handleReset = async () => {
    setSearchTerm("");
    setFilter({
      status_transaksi: '',
      metode_pengiriman: '',
      tanggalAwal: '',
      tanggalAkhir: '',
      harga_min: '',
      harga_max: '',
    });
    setError(null);
    setSearchLoading(true);
    await fetchTransaksi();
    setSearchLoading(false);
  };
  
  // Apply filter
  const handleFilterSearch = async (e) => {
    e && e.preventDefault();
    setSearchLoading(true);
    setError(null);
    
    try {
      // Buat parameter pencarian
      const params = {};
      if (searchTerm) params.keyword = searchTerm;
      if (filter.status_transaksi) params.status_transaksi = filter.status_transaksi;
      if (filter.metode_pengiriman) params.metode_pengiriman = filter.metode_pengiriman;
      if (filter.tanggalAwal) params.tanggal_awal = filter.tanggalAwal;
      if (filter.tanggalAkhir) params.tanggal_akhir = filter.tanggalAkhir;
      if (filter.harga_min) params.harga_min = filter.harga_min;
      if (filter.harga_max) params.harga_max = filter.harga_max;
      
      // Jika tidak ada parameter, ambil semua data
      if (Object.keys(params).length === 0) {
        await fetchTransaksi();
        setSearchLoading(false);
        return;
      }
      
      // Get all transaksi and filter locally
      // Note: In a real app, you might want to implement server-side filtering instead
      const allTransactions = await useAxios.get("/transaksi");
      let transaksiData = Array.isArray(allTransactions.data) ? allTransactions.data : (allTransactions.data.data || []);
      
      // Filter transaksi based on params
      let filtered = transaksiData;
      
      // Filter by keyword
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filtered = filtered.filter(t => 
          (t.id_transaksi && t.id_transaksi.toString().includes(keyword)) ||
          (t.total_harga && t.total_harga.toString().includes(keyword)) ||
          (t.status_transaksi && t.status_transaksi.toLowerCase().includes(keyword)) ||
          (t.metode_pengiriman && t.metode_pengiriman.toLowerCase().includes(keyword))
        );
      }
      
      // Filter by status
      if (params.status_transaksi) {
        filtered = filtered.filter(t => t.status_transaksi === params.status_transaksi);
      }
      
      // Filter by metode pengiriman
      if (params.metode_pengiriman) {
        filtered = filtered.filter(t => t.metode_pengiriman === params.metode_pengiriman);
      }
      
      // Filter by tanggal
      if (params.tanggal_awal) {
        filtered = filtered.filter(t => 
          t.tanggal_transaksi && 
          new Date(t.tanggal_transaksi) >= new Date(params.tanggal_awal)
        );
      }
      
      if (params.tanggal_akhir) {
        filtered = filtered.filter(t => 
          t.tanggal_transaksi && 
          new Date(t.tanggal_transaksi) <= new Date(params.tanggal_akhir)
        );
      }
      
      // Filter by harga
      if (params.harga_min) {
        filtered = filtered.filter(t => t.total_harga >= parseInt(params.harga_min));
      }
      
      if (params.harga_max) {
        filtered = filtered.filter(t => t.total_harga <= parseInt(params.harga_max));
      }
      
      // Ambil nama barang untuk transaksi yang sudah difilter
      const transaksiWithNamaBarang = await Promise.all(
        filtered.map(async (trx) => {
          try {
            const detailResponse = await useAxios.get(`/detailTransaksi/transaksi/${trx.id_transaksi}`);
            const detailItemsData = detailResponse.data.data || detailResponse.data || [];
            let namaBarang = "-";
            if (Array.isArray(detailItemsData) && detailItemsData.length > 0) {
              const barangNames = detailItemsData.map(item => {
                return item.barang?.nama_barang || 
                       (item.barang ? `Barang #${item.id_barang}` : `Barang #${item.id_barang}`);
              });
              namaBarang = barangNames.join(", ");
            }
            return { ...trx, nama_barang: namaBarang };
          } catch (err) {
            console.error(`Error fetching detail for transaction ${trx.id_transaksi}:`, err);
            return { ...trx, nama_barang: "-" };
          }
        })
      );
      
      setTransaksi(transaksiWithNamaBarang);
      setError(transaksiWithNamaBarang.length === 0 ? 'Transaksi tidak ditemukan.' : null);
      
    } catch (err) {
      let errorMsg = 'Gagal melakukan pencarian.';
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setTransaksi([]);
      setError(errorMsg);
      console.error('Search Error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">
          <Alert.Heading>Akses Dibatasi</Alert.Heading>
          <p>{error || "Anda harus login untuk mengakses halaman ini"}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={() => navigate("/LoginPage")}>
              Login
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <PegawaiGudangSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajemen Transaksi</h2>
          </div>

          {/* Card Pencarian */}
          <div className="card mb-4 shadow-sm">
            <form className="card-body" onSubmit={handleFilterSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    id="searchTerm"
                    name="searchTerm"
                    placeholder="Cari transaksi (ID, status, metode pengiriman, harga)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                    disabled={searchLoading}
                  >
                    {searchLoading && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    Cari
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowFilter((prev) => !prev)}
                  >
                    Filter
                  </button>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={handleReset}
                    disabled={searchLoading}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
            
            {/* Filter tambahan */}
            {showFilter && (
              <form className="card-body border-top mt-2" onSubmit={handleFilterSearch}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label">Status Transaksi</label>
                    <select className="form-select" name="status_transaksi" value={filter.status_transaksi} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="pending">Pending</option>
                      <option value="proses">Proses</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                      <option value="lunas">Lunas</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Metode Pengiriman</label>
                    <select className="form-select" name="metode_pengiriman" value={filter.metode_pengiriman} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="Dikirim oleh Kurir">Dikirim oleh Kurir</option>
                      <option value="Diambil Sendiri">Diambil Sendiri</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Tanggal Awal</label>
                    <input type="date" className="form-control" name="tanggalAwal" value={filter.tanggalAwal} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Tanggal Akhir</label>
                    <input type="date" className="form-control" name="tanggalAkhir" value={filter.tanggalAkhir} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Harga Minimal</label>
                    <input type="number" className="form-control" name="harga_min" value={filter.harga_min} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Harga Maksimal</label>
                    <input type="number" className="form-control" name="harga_max" value={filter.harga_max} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tampilkan Jadwal</label>
                    <select 
                      className="form-select" 
                      value={showOnlyUnscheduled ? "0" : "1"} 
                      onChange={(e) => setShowOnlyUnscheduled(e.target.value === "0")}
                    >
                      <option value="0">Hanya belum dijadwalkan</option>
                      <option value="1">Semua transaksi</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary w-100">Terapkan Filter</button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary w-100" 
                      onClick={() => setFilter({
                        status_transaksi: '',
                        metode_pengiriman: '',
                        tanggalAwal: '',
                        tanggalAkhir: '',
                        harga_min: '',
                        harga_max: '',
                      })}
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Error and Time Error Alerts */}
          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-light" onClick={fetchTransaksi}>
                Coba Lagi
              </button>
            </div>
          )}
          {timeError && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>Perhatian!</strong> {timeError}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setTimeError(null)} 
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <span className="ms-2">Memuat data transaksi...</span>
            </div>
          )}
          
          {/* Tabel Transaksi */}
          {!loading && !error && (
            <TransaksiTable
              transaksi={showOnlyUnscheduled ? transaksi.filter(item => !hasJadwal(item.id_transaksi)) : transaksi}
              openDetailModal={openDetailModal}
              openJadwalModal={openJadwalModal}
              updateStatus={updateStatus}
              hasJadwal={hasJadwal}
              canCreateJadwal={canCreateJadwal}
              getJadwalButtonTooltip={getJadwalButtonTooltip}
              loading={loading}
            />
          )}
          
          {/* Modal for creating jadwal */}
          <Modal show={showJadwalModal} onHide={() => setShowJadwalModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Buat Jadwal Pengiriman</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {jadwalSuccess && (
                <Alert variant="success" className="mb-3">
                  <Alert.Heading>Berhasil!</Alert.Heading>
                  <p>{jadwalSuccess}</p>
                  <p className="mb-0">
                    <i className="bi bi-bell"></i> {' '}
                    {isDeliveryByCourier ? 
                      "Notifikasi akan muncul di aplikasi mobile kurir, pembeli, dan pemilik barang." : 
                      "Notifikasi akan muncul di aplikasi mobile pembeli dan pemilik barang."}
                  </p>
                </Alert>
              )}
              
              {jadwalError && (
                <Alert variant="danger" className="mb-3">
                  {jadwalError}
                </Alert>
              )}
              
              {timeError && (
                <Alert variant="warning" className="mb-3">
                  {timeError}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmitJadwal}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Transaksi</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTransaksi?.id_transaksi || ''}
                    disabled
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Metode Pengiriman</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTransaksi?.metode_pengiriman || ''}
                    disabled
                  />
                </Form.Group>
                
                {isDeliveryByCourier && (
                  <Form.Group className="mb-3">
                    <Form.Label>Kurir</Form.Label>
                    <Form.Select
                      name="id_pegawai"
                      value={jadwalData.id_pegawai}
                      onChange={handleJadwalInputChange}
                      required={isDeliveryByCourier}
                    >
                      <option value="">-- Pilih Kurir --</option>
                      {pegawaiList.map(pegawai => (
                        <option key={pegawai.id_pegawai} value={pegawai.id_pegawai}>
                          {pegawai.nama_pegawai} - {pegawai.no_telepon}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Pengiriman</Form.Label>
                  <Form.Control
                    type="date"
                    name="tanggal"
                    value={jadwalData.tanggal}
                    onChange={handleJadwalInputChange}
                    min={isDeliveryByCourier && isPastDeadline() 
                        ? getMinDeliveryDate() // For courier: today or tomorrow based on time
                        : getTodayDate()} // For mandiri: at least today
                    required
                  />
                  {isDeliveryByCourier && isPastDeadline() && (
                    <Form.Text className="text-muted">
                      Pengiriman kurir setelah jam 16:00 hanya bisa dijadwalkan untuk besok atau lebih lambat.
                    </Form.Text>
                  )}
                  {!isDeliveryByCourier && (
                    <Form.Text className="text-muted">
                      Pengambilan mandiri hanya bisa dijadwalkan hari ini atau lebih lambat.
                    </Form.Text>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status Pengiriman</Form.Label>
                  <Form.Select
                    name="status_jadwal"
                    value={jadwalData.status_jadwal}
                    onChange={handleJadwalInputChange}
                    required
                  >
                    {!isDeliveryByCourier && (
                      <option value="Menunggu Diambil">Menunggu Diambil</option>
                    )}
                    {isDeliveryByCourier && (
                      <>
                        <option value="Sedang Dikirim">Sedang Dikirim</option>
                        <option value="Sedang di Kurir">Sedang di Kurir</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={() => setShowJadwalModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" disabled={jadwalLoading}>
                    {jadwalLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-1">Menyimpan...</span>
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
          
          {/* Modal for transaction details */}
          <Modal 
            show={showDetailModal} 
            onHide={() => setShowDetailModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Detail Transaksi</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {console.log("Rendering modal with detailTransaksi:", detailTransaksi)}
              {console.log("Rendering modal with detailItems:", detailItems)}
              {detailLoading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Memuat detail transaksi...</p>
                </div>
              ) : detailError ? (
                <Alert variant="danger">{detailError}</Alert>
              ) : detailTransaksi ? (
                <div>
                  <h5>Informasi Transaksi</h5>
                  <table className="table table-bordered table-sm mb-4">
                    <tbody>
                      <tr>
                        <th>ID Transaksi</th>
                        <td>{detailTransaksi.id_transaksi}</td>
                      </tr>
                      <tr>
                        <th>Tanggal Transaksi</th>
                        <td>{formatDate(detailTransaksi.tanggal_transaksi)}</td>
                      </tr>
                      <tr>
                        <th>Total Harga</th>
                        <td>{formatCurrency(detailTransaksi.total_harga || 0)}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>{getStatusBadge(detailTransaksi.status_transaksi)}</td>
                      </tr>
                      <tr>
                        <th>Metode Pengiriman</th>
                        <td>{detailTransaksi.metode_pengiriman || "-"}</td>
                      </tr>
                      <tr>
                        <th>Status Jadwal</th>
                        <td>{hasJadwal(detailTransaksi.id_transaksi) ? <Badge bg="success">Sudah Dijadwalkan</Badge> : <Badge bg="warning">Belum Dijadwalkan</Badge>}</td>
                      </tr>
                      {detailTransaksi.pembeli && (
                        <tr>
                          <th>Pembeli</th>
                          <td>{detailTransaksi.pembeli.nama_pembeli || "-"}</td>
                        </tr>
                      )}
                      {detailTransaksi.alamat && (
                        <tr>
                          <th>Alamat Pengiriman</th>
                          <td>
                            {detailTransaksi.alamat.alamat_lengkap ? (
                              <>
                                {detailTransaksi.alamat.alamat_lengkap}, {detailTransaksi.alamat.kecamatan}, {detailTransaksi.alamat.kabupaten_kota}, {detailTransaksi.alamat.provinsi} {detailTransaksi.alamat.kode_pos}
                              </>
                            ) : "-"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  <h5>Barang dalam Transaksi</h5>
                  {!detailItems || detailItems.length === 0 ? (
                    <p className="text-center text-muted">Tidak ada barang dalam transaksi ini</p>
                  ) : (
                    <>
                      <div className="alert alert-info mb-3">
                        {detailItems.length} barang ditemukan dalam transaksi ini.
                      </div>
                      <Row>
                        {detailItems.map((item, index) => {
                          console.log(`Rendering item ${index}:`, item);
                          return (
                            <Col md={6} key={item.id_detail_transaksi || `item-${index}`} className="mb-3">
                              <Card>
                                <Row className="g-0">
                                  <Col md={4} className="d-flex align-items-center justify-content-center" style={{ background: '#f8f9fa' }}>
                                    <div style={{ width: '100%', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <img 
                                        src={item.imageUrl} 
                                        alt={`Foto ${item.namaBarang}`}
                                        style={{ 
                                          maxWidth: '100%', 
                                          maxHeight: '100%', 
                                          objectFit: 'contain' 
                                        }}
                                        onError={(e) => {
                                          console.log(`Image load failed for ${item.id_barang}`);
                                          e.target.onerror = null;
                                          // Use inline SVG as fallback for more reliable display
                                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSI+PHBhdGggZD0iTTE2LjUgOS40bC05LTVWMjFsOSA1VjkuNHoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxNi41IDMuNSA3LjUgOC41IDE2LjUgMTMuNSI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=";
                                        }}
                                      />
                                    </div>
                                  </Col>
                                  <Col md={8}>
                                    <Card.Body>
                                      <Card.Title className="h6">{item.namaBarang || 'Barang'}</Card.Title>
                                      <Card.Text className="small mb-1">
                                        <strong>ID Barang:</strong> {item.id_barang}
                                      </Card.Text>
                                      <Card.Text className="small mb-1">
                                        <strong>Jumlah:</strong> {item.jumlah || 1}
                                      </Card.Text>
                                      <Card.Text className="small mb-1">
                                        <strong>Harga:</strong> {formatCurrency(item.harga_item || item.harga_beli || 0)}
                                      </Card.Text>
                                      {/* Tambahkan informasi penitip jika ada */}
                                      {item.barang?.penitipan_barang?.penitip && (
                                        <Card.Text className="small mb-1">
                                          <strong>Penitip:</strong> {item.barang.penitipan_barang.penitip.nama_penitip}
                                        </Card.Text>
                                      )}
                                    </Card.Body>
                                  </Col>
                                </Row>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted">Tidak ada detail yang tersedia</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Tutup
              </Button>
              {detailTransaksi && detailTransaksi.status_transaksi === "lunas" && !hasJadwal(detailTransaksi.id_transaksi) && (
                <Button variant="primary" onClick={() => {
                  setShowDetailModal(false);
                  openJadwalModal(detailTransaksi);
                }}>
                  Buat Jadwal Pengiriman
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TransaksiPage; 