import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Spinner, Modal, Alert } from "react-bootstrap";
import useAxios from "../../api";
import { useNavigate } from "react-router-dom";
import { createBatchKomisiPegawai } from "../../api/KomisiPegawaiApi";
import { createBatchKomisiPerusahaan } from "../../api/KomisiPerusahaanApi";
import { createBatchKomisiPenitip } from "../../api/KomisiPenitipApi";
import { updatePembeliPoints } from "../../api/PembeliApi";
import { getDetailTransaksiByTransaksi, getPenitipanPegawaiByTransaksi, getPenitipanPenitipByTransaksi } from "../../api/DetailTransaksiApi";

const JadwalList = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [processedJadwalIds, setProcessedJadwalIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchJadwal();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (jadwal.length > 0) {
        processExpiredItems();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [jadwal, processedJadwalIds]);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await useAxios.get("/jadwal");
      setJadwal(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jadwal:", error);
      setError("Gagal memuat data jadwal. Silakan coba lagi nanti.");
      setLoading(false);
    }
  };

  const processExpiredItems = async () => {
    const expiredItems = jadwal.filter(item => 
      isEligibleForHangus(item) && !processedJadwalIds.has(item.id_jadwal)
    );
    
    if (expiredItems.length === 0) {
      console.log("No expired items to process");
      return;
    }
    
    console.log(`Found ${expiredItems.length} expired items to process automatically`);
    
    let processedCount = 0;
    const newProcessedIds = new Set(processedJadwalIds);
    
    for (const item of expiredItems) {
      try {
        console.log(`Auto-processing item ID: ${item.id_jadwal}`);
        
        // Mark as being processed to prevent duplicate processing
        newProcessedIds.add(item.id_jadwal);
        
        const success = await directlyMarkAsHangus(item);
        
        if (success) {
          processedCount++;
        }
      } catch (error) {
        console.error(`Error processing item ${item.id_jadwal}:`, error);
      }
    }
    
    // Update the processed IDs after all items have been processed
    setProcessedJadwalIds(newProcessedIds);
    
    if (processedCount > 0) {
      fetchJadwal();
    }
  };

  const directlyMarkAsHangus = async (jadwalItem) => {
    try {
      console.log(`Marking item ${jadwalItem.id_jadwal} as Hangus`);
      
      // Check if we've already processed this jadwal
      if (processedJadwalIds.has(jadwalItem.id_jadwal)) {
        console.log(`Item ${jadwalItem.id_jadwal} has already been processed, skipping`);
        return false;
      }
      
      // Update the status to "Hangus" and create commissions
      const statusUpdated = await updateStatusJadwal(jadwalItem.id_jadwal, "Hangus", true, true);
      
      if (!statusUpdated) {
        console.log(`Failed to update status for jadwal ${jadwalItem.id_jadwal}`);
        return false;
      }
      
      // Mark barang as donated
      await markBarangAsDonated(jadwalItem.id_transaksi);
      
      console.log(`Successfully marked item ${jadwalItem.id_jadwal} as Hangus`);
      return true;
    } catch (error) {
      console.error(`Failed to mark item ${jadwalItem.id_jadwal} as Hangus:`, error);
      return false;
    }
  };

  // Fix the hangus commission creation
  const createHangusKomisi = async (jadwalData) => {
    try {
      console.log("Creating company commission for hangus item:", jadwalData);
      
      // Get transaction details
      const detailTransaksi = await getDetailTransaksiByTransaksi(jadwalData.id_transaksi);
      
      if (!detailTransaksi || detailTransaksi.length === 0) {
        console.warn("No transaction details found, skipping commission creation");
        return;
      }

      console.log(`Transaction ${jadwalData.id_transaksi} has ${detailTransaksi.length} detail records`);
      
      // Check first if any commissions already exist
      try {
        const existingCommissions = await useAxios.get(`/komisiPerusahaan/transaksi/${jadwalData.id_transaksi}`);
        if (existingCommissions.data && existingCommissions.data.length > 0) {
          console.log(`Found existing commissions for transaction ${jadwalData.id_transaksi}, skipping creation`);
          return;
        }
      } catch (error) {
        // If 404 or any error, assume no commissions exist and continue
        console.log(`No existing commissions found for transaction ${jadwalData.id_transaksi}, proceeding with creation`);
      }
      
      // Get only unique items
      const uniqueItemsMap = new Map();
      detailTransaksi.forEach(item => {
        if (item && item.id_barang) {
          if (!uniqueItemsMap.has(item.id_barang)) {
            uniqueItemsMap.set(item.id_barang, item);
          }
        }
      });
      
      const uniqueItems = Array.from(uniqueItemsMap.values());
      console.log(`Creating commissions for ${uniqueItems.length} unique items`);
      
      // Create company kommissions for each item (20% of item price)
      const komisiEntries = uniqueItems.map(item => {
        const komisiPerusahaan = item.harga_item * 0.20;
        console.log(`Computing commission for item ${item.id_barang}: ${komisiPerusahaan}`);
        
        return {
          id_transaksi: jadwalData.id_transaksi,
          jumlah_komisi: komisiPerusahaan,
          id_barang: item.id_barang
        };
      });
      
      // Create all kommissions in a single batch request
      if (komisiEntries.length > 0) {
        try {
          const result = await createBatchKomisiPerusahaan(komisiEntries);
          console.log(`Successfully created ${komisiEntries.length} kommissions for transaction ${jadwalData.id_transaksi}`);
        } catch (error) {
          console.error(`Error creating kommissions:`, error);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in createHangusKomisi:", error);
      return false;
    }
  };

  // Update createKomisi to use the batch approach
  const createKomisi = async (jadwalData) => {
    try {
      console.log("Creating commissions for jadwal:", jadwalData);
      
      // Get transaction details
      const detailTransaksi = await getDetailTransaksiByTransaksi(jadwalData.id_transaksi);
      
      if (!detailTransaksi || detailTransaksi.length === 0) {
        console.warn("No transaction details found, skipping commission creation");
        return false;
      }

      console.log(`Transaction ${jadwalData.id_transaksi} has ${detailTransaksi.length} detail records`);
      
      // Check first if any commissions already exist
      try {
        const existingCommissions = await useAxios.get(`/komisiPerusahaan/transaksi/${jadwalData.id_transaksi}`);
        if (existingCommissions.data && existingCommissions.data.length > 0) {
          console.log(`Found existing commissions for transaction ${jadwalData.id_transaksi}, skipping creation`);
          return true;
        }
      } catch (error) {
        // If 404 or any error, assume no commissions exist and continue
        console.log(`No existing commissions found for transaction ${jadwalData.id_transaksi}, proceeding with creation`);
      }
      
      // Get additional details
      const penitipanPegawaiDetails = await getPenitipanPegawaiByTransaksi(jadwalData.id_transaksi);
      const penitipanPenitipDetails = await getPenitipanPenitipByTransaksi(jadwalData.id_transaksi);
      
      // Get only unique items
      const uniqueItemsMap = new Map();
      detailTransaksi.forEach(item => {
        if (item && item.id_barang) {
          if (!uniqueItemsMap.has(item.id_barang)) {
            uniqueItemsMap.set(item.id_barang, item);
          }
        }
      });
      
      const uniqueItems = Array.from(uniqueItemsMap.values());
      console.log(`Creating commissions for ${uniqueItems.length} unique items`);
      
      // Prepare the commission entries for all types
      const pegawaiEntries = [];
      const penitipEntries = [];
      const perusahaanEntries = [];
      
      // Process each unique item
      for (const item of uniqueItems) {
        const hargaItem = item.harga_item || 0;
        
        // Skip zero-priced items
        if (hargaItem <= 0) {
          console.log(`Skipping zero-priced item ${item.id_barang}`);
          continue;
        }
        
        console.log(`Computing commissions for item ${item.id_barang} with price ${hargaItem}`);
        
        // Calculate commissions
        const totalKomisiPerusahaan = hargaItem * 0.20; // 20% of price
        
        // Create pegawai commission if applicable
        const pegawaiDetail = penitipanPegawaiDetails?.find(p => p.id_barang === item.id_barang);
        if (pegawaiDetail?.id_pegawai) {
          const komisiPegawai = hargaItem * 0.05;  // 5% of price
          pegawaiEntries.push({
            id_transaksi: jadwalData.id_transaksi,
            id_pegawai: pegawaiDetail.id_pegawai,
            jumlah_komisi: komisiPegawai,
            id_barang: item.id_barang
          });
        }
        
        // Create penitip commission if applicable
        const penitipDetail = penitipanPenitipDetails?.find(p => p.id_barang === item.id_barang);
        if (penitipDetail?.id_penitip && penitipDetail?.id_penitipan) {
          const komisiPenitip = totalKomisiPerusahaan * 0.10; // 10% of company commission
          penitipEntries.push({
            id_transaksi: jadwalData.id_transaksi,
            id_penitipan: penitipDetail.id_penitipan,
            jumlah_komisi: komisiPenitip,
            id_barang: item.id_barang
          });
        }
        
        // Calculate company commission (remainder)
        const komisiPenitip = totalKomisiPerusahaan * 0.10;
        const komisiPerusahaan = totalKomisiPerusahaan - komisiPenitip;
        
        // Add company commission
        perusahaanEntries.push({
          id_transaksi: jadwalData.id_transaksi,
          jumlah_komisi: komisiPerusahaan,
          id_barang: item.id_barang
        });
      }
      
      // Create all commissions in batches
      try {
        // Create pegawai commissions
        if (pegawaiEntries.length > 0) {
          console.log(`Creating ${pegawaiEntries.length} KomisiPegawai entries`);
          await createBatchKomisiPegawai(pegawaiEntries);
        }
        
        // Create penitip commissions
        if (penitipEntries.length > 0) {
          console.log(`Creating ${penitipEntries.length} KomisiPenitip entries`);
          await createBatchKomisiPenitip(penitipEntries);
        }
        
        // Create perusahaan commissions
        if (perusahaanEntries.length > 0) {
          console.log(`Creating ${perusahaanEntries.length} KomisiPerusahaan entries`);
          await createBatchKomisiPerusahaan(perusahaanEntries);
        }
        
        console.log("Commission records created successfully");
        return true;
      } catch (error) {
        console.error("Error creating commissions in batch:", error);
        return false;
      }
    } catch (error) {
      console.error("Error in createKomisi:", error);
      return false;
    }
  };

  const updateStatusJadwal = async (id, newStatus, silent = false, createCommission = false) => {
    try {
      if (!silent) {
        setProcessingStatus(true);
      }
      
      const currentJadwal = await useAxios.get(`/jadwal/${id}`);
      
      console.log("Current jadwal data for status update:", currentJadwal.data);
      
      // Check if the status is already set to the new status
      if (currentJadwal.data.status_jadwal === newStatus) {
        console.log(`Jadwal ${id} is already set to ${newStatus}, skipping update`);
        return true;
      }
      
      const response = await useAxios.put(`/jadwal/${id}`, {
        ...currentJadwal.data,
        id_transaksi: currentJadwal.data.id_transaksi,
        id_pegawai: currentJadwal.data.id_pegawai,
        tanggal: currentJadwal.data.tanggal,
        status_jadwal: newStatus
      });
      
      if (newStatus === "Sudah Sampai" || newStatus === "Sudah Diambil") {
        console.log(`Creating commissions for status: ${newStatus}`);
        await createKomisi(currentJadwal.data);
        
        const transaction = await useAxios.get(`/transaksi/${currentJadwal.data.id_transaksi}`);
        
        if (transaction && transaction.data) {
          try {
            const pointsData = {
              id_pembeli: transaction.data.id_pembeli,
              total_harga: transaction.data.total_harga
            };
            
            console.log("Updating buyer points with data:", pointsData);
            await updatePembeliPoints(pointsData);
            console.log("Buyer points updated successfully");
          } catch (error) {
            console.error("Error updating buyer points:", error);
          }
        }
        
        // Add notification message for status changes
        if (!silent) {
          setStatusMessage({
            type: "success",
            text: `Status berhasil diperbarui menjadi ${newStatus}. Notifikasi telah dikirim ke pembeli dan penitip.`
          });
        }
      }
      else if (newStatus === "Hangus" && createCommission) {
        console.log("Creating company commission for hangus status update");
        await createHangusKomisi(currentJadwal.data);
        
        if (!silent) {
          setStatusMessage({
            type: "success",
            text: "Status berhasil diperbarui menjadi Hangus."
          });
        }
      }
      else if (!silent) {
        setStatusMessage({
          type: "success",
          text: "Status berhasil diperbarui"
        });
      }
      
      if (!silent) {
        fetchJadwal();
        setProcessingStatus(false);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating status jadwal:", error);
      console.error("Error response data:", error.response?.data);
      
      if (!silent) {
        setStatusMessage({
          type: "danger",
          text: `Gagal mengubah status jadwal: ${error.response?.data?.message || error.message}`
        });
        setProcessingStatus(false);
      }
      
      return false;
    }
  };

  const handleCetakNota = (jadwalId) => {
    navigate(`/pegawaiGudang/nota-pengiriman/${jadwalId}`);
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Tidak Ada</Badge>;

    switch (status) {
      case "Menunggu Diambil":
        return <Badge bg="warning">Menunggu Diambil</Badge>;
      case "Sedang Dikirim":
        return <Badge bg="info">Sedang Dikirim</Badge>;
      case "Sedang di Kurir":
        return <Badge bg="primary">Sedang di Kurir</Badge>;
      case "Sudah Diambil":
        return <Badge bg="success">Sudah Diambil</Badge>;
      case "Sudah Sampai":
        return <Badge bg="success">Sudah Sampai</Badge>;
      case "Hangus":
        return <Badge bg="danger">Hangus</Badge>;
      case "Dibatalkan":
        return <Badge bg="danger">Dibatalkan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getDaysSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isCourierDelivery = (item) => {
    return item && item.pegawai && item.id_pegawai;
  };

  const markBarangAsDonated = async (idTransaksi) => {
    try {
      const detailTransaksi = await getDetailTransaksiByTransaksi(idTransaksi);
      
      if (!detailTransaksi || detailTransaksi.length === 0) {
        console.warn("No transaction details found for donation update");
        return;
      }
      
      console.log("Transaction details for donation:", detailTransaksi);
      
      for (const detail of detailTransaksi) {
        const idBarang = detail.id_barang;
        
        if (idBarang) {
          try {
            const barangResponse = await useAxios.get(`/barang/${idBarang}`);
            const barangData = barangResponse.data;
            
            await useAxios.put(`/barang/${idBarang}`, {
              ...barangData,
              status_barang: "Barang sudah Didonasikan"
            });
            
            console.log(`Barang ${idBarang} marked as donated`);
          } catch (error) {
            console.error(`Error updating barang ${idBarang}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error marking barang as donated:", error);
      throw error;
    }
  };

  const isEligibleForHangus = (item) => {
    if (item.status_jadwal !== "Menunggu Diambil") return false;
    
    const daysPassed = getDaysSince(item.tanggal);
    return daysPassed >= 2;
  };

  // Function to update jadwal status
  const updateJadwalStatus = async (jadwalId, newStatus) => {
    try {
      setProcessingStatus(true);
      setStatusMessage(null);
      
      // Get current jadwal data
      const jadwalResponse = await useAxios.get(`/jadwal/${jadwalId}`);
      const currentJadwal = jadwalResponse.data;
      
      // Update the status
      const response = await useAxios.put(`/jadwal/${jadwalId}`, {
        ...currentJadwal,
        id_transaksi: currentJadwal.id_transaksi,
        id_pegawai: currentJadwal.id_pegawai,
        tanggal: currentJadwal.tanggal,
        status_jadwal: newStatus
      });
      
      setStatusMessage({
        type: "success",
        text: `Status berhasil diperbarui menjadi ${newStatus}`
      });
      
      fetchJadwal(); // Refresh the jadwal list
    } catch (error) {
      console.error("Error updating jadwal status:", error);
      setStatusMessage({
        type: "danger",
        text: `Gagal mengubah status: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setProcessingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data jadwal...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Daftar Penjadwalan Pengiriman</h2>
        <Button 
          variant="success" 
          onClick={() => fetchJadwal()}
        >
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {statusMessage && (
        <Alert 
          variant={statusMessage.type} 
          onClose={() => setStatusMessage(null)} 
          dismissible
          className="mb-3"
        >
          {statusMessage.text}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead className="bg-light">
          <tr>
            <th>No.</th>
            <th>Id transaksi</th>
            <th>Kurir</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {jadwal.length > 0 ? (
            jadwal.map((item, index) => (
              <tr key={item.id_jadwal}>
                <td>{index + 1}</td>
                <td>{item.id_transaksi}</td>
                <td>
                  {item.pegawai ? (
                    <>
                      <div>{item.pegawai.nama_pegawai}</div>
                      <small className="text-muted">{item.pegawai.no_telepon}</small>
                    </>
                  ) : (
                    "Diambil Mandiri"
                  )}
                </td>
                <td>
                  {formatDate(item.tanggal)}
                </td>
                <td>{getStatusBadge(item.status_jadwal)}</td>
                <td>
                  {item.status_jadwal === "Sedang Dikirim" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => updateStatusJadwal(item.id_jadwal, "Sedang di Kurir")}
                        disabled={processingStatus}
                        title="Tandai barang sedang di kurir dan kirim notifikasi"
                      >
                        Tandai Sedang di Kurir
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => updateStatusJadwal(item.id_jadwal, "Sudah Sampai")}
                        disabled={processingStatus}
                        title="Tandai barang sudah sampai dan kirim notifikasi"
                      >
                        Tandai Sudah Sampai
                      </Button>
                    </>
                  )}
                  
                  {item.status_jadwal === "Menunggu Diambil" && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => updateStatusJadwal(item.id_jadwal, "Sudah Diambil")}
                      disabled={processingStatus}
                      title="Tandai barang sudah diambil dan kirim notifikasi"
                    >
                      Tandai Sudah Diambil
                    </Button>
                  )}
                  
                  {item.status_jadwal === "Sedang di Kurir" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => updateStatusJadwal(item.id_jadwal, "Sudah Sampai")}
                        disabled={processingStatus}
                        title="Tandai barang sudah sampai dan kirim notifikasi"
                      >
                        Tandai Sudah Sampai
                      </Button>
                    </>
                  )}
                  
                  {isCourierDelivery(item) && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleCetakNota(item.id_jadwal)}
                      title="Cetak nota pengiriman"
                    >
                      <i className="bi bi-printer"></i> Cetak Nota
                    </Button>
                  )}
                  
                  {!isCourierDelivery(item) && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => navigate(`/pegawaiGudang/nota-pengambilan/${item.id_jadwal}`)}
                      title="Cetak nota pengambilan"
                    >
                      <i className="bi bi-printer"></i> Cetak Nota
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                Tidak ada jadwal pengiriman ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default JadwalList; 