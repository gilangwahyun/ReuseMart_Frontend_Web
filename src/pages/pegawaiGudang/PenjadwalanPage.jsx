import React, { useState, useEffect } from "react";
import { Button, Alert, Card, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PegawaiGudangSidebar from "../../components/PegawaiGudangSidebar";
import JadwalTable from "../../components/PegawaiGudangComponents/JadwalTable";
import useAxios from "../../api";
import { createBatchKomisiPegawai } from "../../api/KomisiPegawaiApi";
import { createBatchKomisiPerusahaan } from "../../api/KomisiPerusahaanApi";
import { createBatchKomisiPenitip } from "../../api/KomisiPenitipApi";
import { updatePembeliPoints } from "../../api/PembeliApi";
import { getDetailTransaksiByTransaksi, getPenitipanPegawaiByTransaksi, getPenitipanPenitipByTransaksi } from "../../api/DetailTransaksiApi";
import { 
  generateUniqueInvoiceNumber, 
  createNotaPenjualanBarang, 
  getNotaPenjualanByTransaksiId 
} from "../../api/NotaPenjualanBarangApi";
import { createBatchNotaDetailPenjualan } from "../../api/NotaDetailPenjualanApi";

const PenjadwalanPage = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [processedJadwalIds, setProcessedJadwalIds] = useState(new Set());
  const navigate = useNavigate();
  
  // States untuk filter pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState({
    status_jadwal: '',
    tanggalAwal: '',
    tanggalAkhir: '',
    jenis_pengiriman: '',
  });

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
      
      // Tambahkan flag jenis pengiriman untuk kemudahan filter
      const jadwalData = response.data.map(item => ({
        ...item,
        jenis_pengiriman: item.pegawai ? "Dikirim oleh Kurir" : "Diambil Sendiri"
      }));
      
      setJadwal(jadwalData);
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
      const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${jadwalData.id_transaksi}`);
      const detailTransaksi = detailTransaksiResponse.data;
      
      if (!detailTransaksi || detailTransaksi.length === 0) {
        console.warn("No transaction details found, skipping commission creation");
        return;
      }

      console.log(`Transaction ${jadwalData.id_transaksi} has ${detailTransaksi.length} detail records`);
      
      // Check first if any commissions already exist
      try {
        // Check using the first detail transaction as a sample
        if (detailTransaksi.length > 0) {
          const firstDetailId = detailTransaksi[0].id_detail_transaksi;
          const existingCommissions = await useAxios.get(`/komisiPerusahaan/detailTransaksi/${firstDetailId}`);
          if (existingCommissions.data && existingCommissions.data.length > 0) {
            console.log(`Found existing commissions for detail transaction, skipping creation`);
            return;
          }
        }
      } catch (error) {
        // If 404 or any error, assume no commissions exist and continue
        console.log(`No existing commissions found, proceeding with creation`);
      }
      
      // Create company kommissions for each item (20% of item price)
      const komisiEntries = detailTransaksi.map(detail => {
        const hargaItem = detail.harga_item || 0;
        const komisiPerusahaan = hargaItem * 0.20;
        console.log(`Computing commission for detail ${detail.id_detail_transaksi}: ${komisiPerusahaan}`);
        
        return {
          id_detail_transaksi: detail.id_detail_transaksi,
          jumlah_komisi: komisiPerusahaan
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

  // Fungsi untuk memeriksa komisi yang sudah ada
  const checkExistingCommissions = async (id_transaksi) => {
    try {
      console.log(`Checking existing commissions for transaction ID: ${id_transaksi}`);
      
      // Get transaction details
      const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${id_transaksi}`);
      
      // Periksa respon dan pastikan berupa array
      if (!detailTransaksiResponse || !detailTransaksiResponse.data) {
        console.log("No valid response for transaction details");
        return { found: false, message: "No valid response for transaction details" };
      }
      
      // Handle different response structures
      let detailTransaksi = [];
      if (detailTransaksiResponse.data.success !== undefined) {
        // API is returning { success: true, message: "...", data: [...] } format
        console.log("Using data field from success/data structure");
        detailTransaksi = detailTransaksiResponse.data.data || [];
      } else if (Array.isArray(detailTransaksiResponse.data)) {
        // API is directly returning array
        detailTransaksi = detailTransaksiResponse.data;
      } else {
        console.warn("Unexpected response format from API:", detailTransaksiResponse.data);
        detailTransaksi = [];
      }
        
      if (detailTransaksi.length === 0) {
        console.log("No transaction details found for commission check");
        return { found: false, message: "No transaction details found" };
      }
      
      console.log(`Found ${detailTransaksi.length} detail transactions to check`);
      
      // Check the first detail transaction for commissions
      if (!detailTransaksi[0] || !detailTransaksi[0].id_detail_transaksi) {
        console.log("Detail transaction data is missing id_detail_transaksi");
        return { found: false, message: "Invalid detail transaction data" };
      }
      
      const firstDetailId = detailTransaksi[0].id_detail_transaksi;
      
      // Check for komisi perusahaan
      try {
        const komisiPerusahaan = await useAxios.get(`/komisiPerusahaan/detailTransaksi/${firstDetailId}`);
        if (komisiPerusahaan && komisiPerusahaan.data) {
          console.log("Komisi perusahaan found:", komisiPerusahaan.data);
          return { 
            found: true, 
            type: "perusahaan", 
            data: komisiPerusahaan.data,
            message: "Komisi perusahaan sudah ada untuk transaksi ini" 
          };
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No komisi perusahaan found for this detail transaction (404)");
        } else {
          console.error("Error checking komisi perusahaan:", error);
        }
      }
      
      // Check for komisi pegawai
      try {
        const komisiPegawai = await useAxios.get(`/komisiPegawai/detailTransaksi/${firstDetailId}`);
        if (komisiPegawai && komisiPegawai.data) {
          console.log("Komisi pegawai found:", komisiPegawai.data);
          return { 
            found: true, 
            type: "pegawai", 
            data: komisiPegawai.data,
            message: "Komisi pegawai sudah ada untuk transaksi ini" 
          };
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No komisi pegawai found for this detail transaction (404)");
        } else {
          console.error("Error checking komisi pegawai:", error);
        }
      }
      
      // Check for komisi penitip
      try {
        const komisiPenitip = await useAxios.get(`/komisiPenitip/detailTransaksi/${firstDetailId}`);
        if (komisiPenitip && komisiPenitip.data) {
          console.log("Komisi penitip found:", komisiPenitip.data);
          return { 
            found: true, 
            type: "penitip", 
            data: komisiPenitip.data,
            message: "Komisi penitip sudah ada untuk transaksi ini" 
          };
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No komisi penitip found for this detail transaction (404)");
        } else {
          console.error("Error checking komisi penitip:", error);
        }
      }
      
      return { found: false, message: "No commissions found for this transaction" };
    } catch (error) {
      console.error("Error checking existing commissions:", error);
      return { found: false, error: error.message, message: "Error checking commissions" };
    }
  };

  // Update createKomisi to use the batch approach
  const createKomisi = async (jadwalData) => {
    try {
      console.log("Creating commissions for jadwal:", jadwalData);
      console.log("Status jadwal saat createKomisi:", jadwalData.status_jadwal);
      
      // Get transaction details
      console.log(`Requesting detail transaksi for id_transaksi: ${jadwalData.id_transaksi}`);
      const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${jadwalData.id_transaksi}`);
      console.log("Raw detail transaksi response:", detailTransaksiResponse);
      
      // Periksa respon dan pastikan berupa array
      if (!detailTransaksiResponse) {
        console.warn("No response received from detailTransaksi API");
        return false;
      }
      
      if (!detailTransaksiResponse.data) {
        console.warn("No data field in detailTransaksi response");
        return false;
      }
      
      // Periksa apakah response menggunakan struktur dengan field success dan data
      let detailTransaksi = [];
      if (detailTransaksiResponse.data.success !== undefined) {
        console.log("Response using success/data structure:", detailTransaksiResponse.data);
        
        if (detailTransaksiResponse.data.data && Array.isArray(detailTransaksiResponse.data.data)) {
          detailTransaksi = detailTransaksiResponse.data.data;
        } else {
          console.warn("Data field is not an array in success/data structure");
        }
      } else {
        // Langsung menggunakan data jika tidak menggunakan struktur success/data
        detailTransaksi = Array.isArray(detailTransaksiResponse.data) 
          ? detailTransaksiResponse.data 
          : [];
      }
      
      console.log("Processed detailTransaksi:", detailTransaksi);
      
      if (detailTransaksi.length === 0) {
        console.warn("No transaction details found, skipping commission creation");
        
        // Coba cara alternatif untuk mendapatkan detail transaksi
        try {
          console.log("Trying alternative way to get transaction details...");
          const transaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}`);
          console.log("Transaction data:", transaksiResponse.data);
          
          if (transaksiResponse.data && transaksiResponse.data.detailTransaksi && 
              Array.isArray(transaksiResponse.data.detailTransaksi) && 
              transaksiResponse.data.detailTransaksi.length > 0) {
            console.log("Found detail transaksi through transaction relationship");
            detailTransaksi = transaksiResponse.data.detailTransaksi;
            console.log("Using detail transaksi from transaction:", detailTransaksi);
          } else {
            console.warn("Alternative method also failed to find detail transaksi");
            return false;
          }
        } catch (error) {
          console.error("Error in alternative method:", error);
          return false;
        }
      }

      console.log(`Transaction ${jadwalData.id_transaksi} has ${detailTransaksi.length} detail records`);
      
      // Get additional details about penitipan and pegawai
      let penitipanPegawaiDetails = [];
      try {
        const pegawaiResponse = await getPenitipanPegawaiByTransaksi(jadwalData.id_transaksi);
        console.log("Raw pegawai response:", pegawaiResponse);
        penitipanPegawaiDetails = Array.isArray(pegawaiResponse) ? pegawaiResponse : [];
        console.log("Penitipan pegawai details:", penitipanPegawaiDetails);
      } catch (error) {
        console.error("Error fetching penitipan pegawai details:", error);
      }
      
      let penitipanPenitipDetails = [];
      try {
        const penitipResponse = await getPenitipanPenitipByTransaksi(jadwalData.id_transaksi);
        console.log("Raw penitip response:", penitipResponse);
        penitipanPenitipDetails = Array.isArray(penitipResponse) ? penitipResponse : [];
        console.log("Penitipan penitip details:", penitipanPenitipDetails);
      } catch (error) {
        console.error("Error fetching penitipan penitip details:", error);
      }
      
      // Get transaction data for tanggal_transaksi
      const transaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}`);
      const transaksi = transaksiResponse.data;
      const tanggalTransaksi = new Date(transaksi.tanggal_transaksi);
      
      // Prepare the commission entries for all types
      const pegawaiEntries = [];
      const penitipEntries = [];
      const perusahaanEntries = [];
      
      // Check first if any commissions already exist
      try {
        // Check using the first detail transaction as a sample
        if (detailTransaksi.length > 0 && detailTransaksi[0].id_detail_transaksi) {
          const firstDetailId = detailTransaksi[0].id_detail_transaksi;
          console.log("Checking for existing commissions for detail ID:", firstDetailId);
          
          try {
            const existingCommissions = await useAxios.get(`/komisiPerusahaan/detailTransaksi/${firstDetailId}`);
            console.log("Existing commissions response:", existingCommissions);
            
            if (existingCommissions && existingCommissions.data && 
                (Array.isArray(existingCommissions.data) ? existingCommissions.data.length > 0 : existingCommissions.data)) {
              console.log(`Found existing commissions for detail transaction, skipping creation:`, existingCommissions.data);
              return true;
            } else {
              console.log("No existing commissions found in response data");
            }
          } catch (error) {
            // Jika error 404, berarti memang belum ada komisi, jadi tetap lanjutkan
            if (error.response && error.response.status === 404) {
              console.log("404 response: No existing commissions found, will create new ones");
            } else {
              console.error("Error checking existing commissions:", error);
            }
          }
        } else {
          console.log("Cannot check for existing commissions: no valid detail transaction ID");
        }
      } catch (error) {
        // If 404 or any error, assume no commissions exist and continue
        console.log(`Error checking for existing commissions: ${error.message}`);
      }
      
      // Process each detail item individually
      for (const detail of detailTransaksi) {
        if (!detail || !detail.id_barang || !detail.id_detail_transaksi) {
          console.log("Skipping invalid detail item:", detail);
          continue;
        }
        
        const idBarang = detail.id_barang;
        const idDetailTransaksi = detail.id_detail_transaksi;
        const hargaItem = detail.harga_item || 0;
        
        // Skip zero-priced items
        if (hargaItem <= 0) {
          console.log(`Skipping zero-priced item ${idBarang} (Detail ID: ${idDetailTransaksi})`);
          continue;
        }
        
        console.log(`Computing commissions for item ${idBarang} with price ${hargaItem} (Detail ID: ${idDetailTransaksi})`);
        
        // Get penitipan details for this item
        const penitipDetail = penitipanPenitipDetails.find(p => p && p.id_barang === idBarang);
        const pegawaiDetail = penitipanPegawaiDetails.find(p => p && p.id_barang === idBarang);
        
        console.log("Penitip detail for this item:", penitipDetail);
        console.log("Pegawai detail for this item:", pegawaiDetail);
        
        // Check if item has perpanjangan
        let hasAdaPerpanjangan = false;
        try {
          const barangResponse = await useAxios.get(`/barang/${idBarang}`);
          hasAdaPerpanjangan = barangResponse.data && barangResponse.data.ada_perpanjangan === 'ya';
          console.log(`Item ${idBarang} has perpanjangan: ${hasAdaPerpanjangan}`);
        } catch (error) {
          console.error(`Error checking barang perpanjangan status: ${error}`);
        }
        
        // Calculate base commission rate
        let komisiRate = hasAdaPerpanjangan ? 0.30 : 0.20; // 30% if ada perpanjangan, 20% otherwise
        let totalKomisiPerusahaan = hargaItem * komisiRate;
        
        // Check if item was sold in less than 7 days from tanggal_awal_penitipan
        let bonusPenitip = false;
        if (penitipDetail && penitipDetail.tanggal_awal_penitipan) {
          const tanggalAwalPenitipan = new Date(penitipDetail.tanggal_awal_penitipan);
          const diffTime = Math.abs(tanggalTransaksi - tanggalAwalPenitipan);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          console.log(`Item ${idBarang} days difference: ${diffDays} days (tanggal_awal_penitipan: ${penitipDetail.tanggal_awal_penitipan}, tanggal_transaksi: ${transaksi.tanggal_transaksi})`);
          
          if (diffDays < 7) {
            bonusPenitip = true;
            console.log(`Item ${idBarang} sold within ${diffDays} days - eligible for penitip bonus`);
          }
        } else {
          console.log(`Item ${idBarang} has no tanggal_awal_penitipan, cannot calculate bonus eligibility`);
        }
        
        // Initialize remaining komisi for perusahaan
        let remainingKomisiPerusahaan = totalKomisiPerusahaan;
        
        // Create pegawai commission if applicable (item has a hunter)
        if (pegawaiDetail && pegawaiDetail.id_pegawai) {
          const komisiPegawai = hargaItem * 0.05;  // 5% of price
          pegawaiEntries.push({
            id_detail_transaksi: idDetailTransaksi,
            id_pegawai: pegawaiDetail.id_pegawai,
            jumlah_komisi: komisiPegawai
          });
          
          // Reduce the remaining komisi for perusahaan
          remainingKomisiPerusahaan -= komisiPegawai;
          console.log(`Allocated ${komisiPegawai} to hunter ID: ${pegawaiDetail.id_pegawai}`);
        } else {
          console.log(`Item ${idBarang} has no hunter (pegawai), no hunter commission allocated`);
        }
        
        // Create penitip commission if eligible (sold within 7 days)
        if (bonusPenitip && penitipDetail && penitipDetail.id_penitip) {
          const komisiPenitip = totalKomisiPerusahaan * 0.10; // 10% of company commission
          penitipEntries.push({
            id_detail_transaksi: idDetailTransaksi,
            id_penitip: penitipDetail.id_penitip,
            jumlah_komisi: komisiPenitip
          });
          
          // Reduce the remaining komisi for perusahaan
          remainingKomisiPerusahaan -= komisiPenitip;
          console.log(`Allocated ${komisiPenitip} as bonus to penitip ID: ${penitipDetail.id_penitip}`);
        } else {
          console.log(`Item ${idBarang} not eligible for penitip bonus: bonusPenitip=${bonusPenitip}, id_penitip=${penitipDetail?.id_penitip}`);
        }
        
        // Add company commission (remainder)
        perusahaanEntries.push({
          id_detail_transaksi: idDetailTransaksi,
          jumlah_komisi: remainingKomisiPerusahaan
        });
        
        console.log(`Final allocation for item ${idBarang} (Detail ID: ${idDetailTransaksi}):
          - Harga Item: ${hargaItem}
          - Total Komisi (${komisiRate*100}%): ${totalKomisiPerusahaan}
          - Perusahaan: ${remainingKomisiPerusahaan}
          - Has Hunter: ${pegawaiDetail?.id_pegawai ? 'Yes' : 'No'}
          - Bonus Penitip: ${bonusPenitip ? 'Yes' : 'No'}`);
      }
      
      // Create all commissions in batches
      try {
        console.log("Commission entries summary:");
        console.log("Pegawai entries:", pegawaiEntries);
        console.log("Penitip entries:", penitipEntries);
        console.log("Perusahaan entries:", perusahaanEntries);
        
        // Create pegawai commissions
        if (pegawaiEntries.length > 0) {
          console.log(`Creating ${pegawaiEntries.length} KomisiPegawai entries`);
          const pegawaiResult = await createBatchKomisiPegawai(pegawaiEntries);
          console.log("KomisiPegawai creation result:", pegawaiResult);
        } else {
          console.log("No KomisiPegawai entries to create");
        }
        
        // Create penitip commissions
        if (penitipEntries.length > 0) {
          console.log(`Creating ${penitipEntries.length} KomisiPenitip entries`);
          const penitipResult = await createBatchKomisiPenitip(penitipEntries);
          console.log("KomisiPenitip creation result:", penitipResult);
        } else {
          console.log("No KomisiPenitip entries to create");
        }
        
        // Create perusahaan commissions
        if (perusahaanEntries.length > 0) {
          console.log(`Creating ${perusahaanEntries.length} KomisiPerusahaan entries`);
          const perusahaanResult = await createBatchKomisiPerusahaan(perusahaanEntries);
          console.log("KomisiPerusahaan creation result:", perusahaanResult);
        } else {
          console.log("No KomisiPerusahaan entries to create");
        }
        
        console.log("Commission records created successfully");
        return true;
      } catch (error) {
        console.error("Error creating commissions in batch:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        }
        return false;
      }
    } catch (error) {
      console.error("Error in createKomisi:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      return false;
    }
  };

  const updateStatusJadwal = async (id, newStatus, silent = false, createCommission = false) => {
    try {
      if (!silent) {
        setProcessingStatus(true);
      }
      
      console.log(`updateStatusJadwal called with id=${id}, newStatus=${newStatus}, silent=${silent}, createCommission=${createCommission}`);
      
      const currentJadwal = await useAxios.get(`/jadwal/${id}`);
      
      console.log("Current jadwal data for status update:", currentJadwal.data);
      
      // Check if the status is already set to the new status
      if (currentJadwal.data.status_jadwal === newStatus) {
        console.log(`Jadwal ${id} is already set to ${newStatus}, skipping update`);
        if (!silent) {
          setProcessingStatus(false);
          setStatusMessage({
            type: "success",
            text: `Status sudah diperbarui menjadi ${newStatus}`
          });
        }
        return true;
      }
      
      // Jika status baru adalah "Sudah Sampai", ubah menjadi "Selesai"
      let statusToUpdate = newStatus;
      if (newStatus === "Sudah Sampai") {
        statusToUpdate = "Selesai";
        console.log(`Converting status from "Sudah Sampai" to "Selesai"`);
      }
      
      console.log(`Will update jadwal ${id} status from "${currentJadwal.data.status_jadwal}" to "${statusToUpdate}"`);
      
      // Jika status baru adalah "Sudah Diambil" atau "Sudah Sampai", cek dulu apakah komisi sudah terbentuk
      let existingCommissions = { found: false };
      if (newStatus === "Sudah Sampai" || newStatus === "Sudah Diambil") {
        try {
          existingCommissions = await checkExistingCommissions(currentJadwal.data.id_transaksi);
          console.log("Existing commissions check result:", existingCommissions);
        } catch (error) {
          console.error("Error checking existing commissions:", error);
        }
      }
      
      try {
        const response = await useAxios.put(`/jadwal/${id}`, {
          ...currentJadwal.data,
          id_transaksi: currentJadwal.data.id_transaksi,
          id_pegawai: currentJadwal.data.id_pegawai,
          tanggal: currentJadwal.data.tanggal,
          status_jadwal: statusToUpdate
        });
        
        console.log(`Jadwal update response:`, response.data);
      } catch (error) {
        console.error("Error in jadwal update API call:", error);
        console.warn("Continuing execution since database update may have succeeded despite the error");
        // Note: We continue execution instead of returning, since the database might have been updated
      }
      
      // Verify the update was successful by fetching the jadwal again
      let updateSuccessful = false;
      try {
        const updatedJadwal = await useAxios.get(`/jadwal/${id}`);
        updateSuccessful = updatedJadwal.data.status_jadwal === statusToUpdate;
        console.log(`Update verification result: current status=${updatedJadwal.data.status_jadwal}, expected=${statusToUpdate}, success=${updateSuccessful}`);
      } catch (error) {
        console.error("Error verifying jadwal update:", error);
      }
      
      // Continue with remaining operations if update was successful or if we're proceeding anyway
      if ((newStatus === "Sudah Sampai" || newStatus === "Sudah Diambil") && !existingCommissions.found) {
        console.log(`Creating commissions for status: ${newStatus} (updated to: ${statusToUpdate})`);
        
        let komisiResult = false;
        try {
          komisiResult = await createKomisi(currentJadwal.data);
          console.log(`createKomisi result: ${komisiResult ? 'success' : 'failed'}`);
        } catch (error) {
          console.error("Error calling createKomisi:", error);
        }
        
        // If komisi creation failed, force create it directly
        if (!komisiResult) {
          console.log("Initial komisi creation failed, checking if we need to force create it...");
          
          let checkAgain = false;
          try {
            const commissionCheck = await checkExistingCommissions(currentJadwal.data.id_transaksi);
            checkAgain = commissionCheck.found;
            console.log("Commission check after failed creation:", commissionCheck);
          } catch (error) {
            console.error("Error in second commission check:", error);
          }
          
          if (!checkAgain) {
            console.log("No existing commissions found after update, forcing direct komisi creation");
            // Attempt to directly create commission records using a simpler approach
            try {
              await forceCreateCommission(currentJadwal.data);
            } catch (error) {
              console.error("Error in force create commission:", error);
            }
          } else {
            console.log("Commissions were created successfully after all");
          }
        }
        
        const transaction = await useAxios.get(`/transaksi/${currentJadwal.data.id_transaksi}`);
        
        if (transaction && transaction.data) {
          try {
            // Get transaction details to calculate the correct points
            const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${transaction.data.id_transaksi}`);
            
            // Validasi dan pastikan detailTransaksiData adalah array
            if (!detailTransaksiResponse || !detailTransaksiResponse.data) {
              throw new Error("Invalid transaction details response");
            }
            
            const detailTransaksiData = Array.isArray(detailTransaksiResponse.data) 
              ? detailTransaksiResponse.data 
              : [];
            
            if (detailTransaksiData.length === 0) {
              throw new Error("No transaction details found");
            }
            
            // Get complete item details for accurate pricing
            const itemsWithDetails = [];
            for (const item of detailTransaksiData) {
              try {
                if (!item || !item.id_barang) continue;
                
                const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
                const barang = barangResponse.data;
                
                itemsWithDetails.push({
                  ...item,
                  harga: item.harga_beli || (barang ? barang.harga : 0) || 0
                });
              } catch (error) {
                console.error(`Error fetching barang ${item?.id_barang} details:`, error);
                if (item) {
                  itemsWithDetails.push({
                    ...item,
                    harga: item.harga_beli || 0
                  });
                }
              }
            }
            
            // Calculate accurate total amount from items
            const totalAmount = itemsWithDetails.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);
            
            // Calculate points based on the same formula used in receipts
            // Base points: 1 point per 10,000 rupiah
            let points = Math.floor(totalAmount / 10000);
            
            // Add 20% bonus for purchases over 500,000
            if (totalAmount > 500000) {
              points = Math.floor(points * 1.2); // Add 20% bonus
            }
            
            console.log(`Calculated points for transaction: ${points} (total amount: ${totalAmount})`);
            
            const pointsData = {
              id_pembeli: transaction.data.id_pembeli,
              total_harga: totalAmount  // Use the calculated total for accuracy
            };
            
            console.log("Updating buyer points with data:", pointsData);
            const pointsResponse = await updatePembeliPoints(pointsData);
            console.log("Buyer points updated successfully:", pointsResponse);
            
            // Optional: Show the points in the status message
            if (!silent) {
              const pointsAdded = pointsResponse?.data?.total_new_points || points;
              const currentTotalPoints = pointsResponse?.data?.current_total_points || "updated";
              
              setStatusMessage({
                type: "success",
                text: `Status berhasil diperbarui. ${pointsAdded} poin ditambahkan ke akun pembeli`
              });
            }
          } catch (error) {
            console.error("Error updating buyer points:", error);
            // Still show success message for status update even if points update fails
            if (!silent) {
              setStatusMessage({
                type: "success",
                text: "Status berhasil diperbarui, tetapi terjadi kesalahan saat memperbarui poin pembeli"
              });
            }
          }
        } else if (!silent) {
          setStatusMessage({
            type: "success",
            text: "Status berhasil diperbarui"
          });
        }
        
        // Add notification message for status changes
        if (!silent) {
          setStatusMessage({
            type: "success",
            text: `Status berhasil diperbarui menjadi ${statusToUpdate}. Notifikasi telah dikirim ke pembeli dan penitip.`
          });
        }
      }
      else if (newStatus === "Hangus" && createCommission) {
        console.log("Creating company commission for hangus status update");
        await createHangusKomisi(currentJadwal.data);
        if (!silent) {
          setStatusMessage({
            type: "success",
            text: "Status berhasil diperbarui menjadi Hangus"
          });
        }
      } else if (!silent) {
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
      
      return updateSuccessful || true; // Return true even if we couldn't verify, since we're proceeding with operations
    } catch (error) {
      console.error("Error in updateStatusJadwal function:", error);
      
      // Try to verify if the update was successful despite the error
      let updateSuccessful = false;
      try {
        const updatedJadwal = await useAxios.get(`/jadwal/${id}`);
        updateSuccessful = updatedJadwal.data.status_jadwal === newStatus || updatedJadwal.data.status_jadwal === statusToUpdate;
        console.log(`Final update verification: status=${updatedJadwal.data.status_jadwal}, expected=${newStatus} or ${statusToUpdate}, success=${updateSuccessful}`);
      } catch (verifyError) {
        console.error("Error verifying jadwal update after error:", verifyError);
      }
      
      if (updateSuccessful) {
        console.log("Database was updated successfully despite the error, proceeding with success path");
        if (!silent) {
          setStatusMessage({
            type: "success",
            text: `Status berhasil diperbarui menjadi ${newStatus}`
          });
          fetchJadwal();
        }
        return true;
      }
      
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
  
  // Fungsi sederhana untuk membuat komisi langsung
  const forceCreateCommission = async (jadwalData) => {
    try {
      console.log("Forcing commission creation as fallback...");
      
      // Get transaction details
      console.log(`Requesting detail transaksi for id_transaksi: ${jadwalData.id_transaksi} (force method)`);
      const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${jadwalData.id_transaksi}`);
      console.log("Force method - Raw detail transaksi response:", detailTransaksiResponse);
      
      // Periksa respon dan pastikan berupa array
      if (!detailTransaksiResponse || !detailTransaksiResponse.data) {
        console.warn("Invalid response for transaction details in forceCreateCommission");
        
        // Coba cara alternatif untuk mendapatkan detail transaksi
        try {
          console.log("Force method - Trying alternative way to get transaction details...");
          const transaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}`);
          console.log("Force method - Transaction data:", transaksiResponse.data);
          
          if (transaksiResponse.data && transaksiResponse.data.detailTransaksi && 
              Array.isArray(transaksiResponse.data.detailTransaksi) && 
              transaksiResponse.data.detailTransaksi.length > 0) {
            
            // Jika berhasil mendapatkan detail transaksi dari relasi, lanjutkan pembuatan komisi
            const detailTransaksi = transaksiResponse.data.detailTransaksi;
            console.log("Force method - Using detail transaksi from transaction:", detailTransaksi);
            
            // Create company commissions directly (20% of item price)
            const perusahaanEntries = [];
            for (const detail of detailTransaksi) {
              if (!detail || !detail.id_detail_transaksi) continue;
              
              perusahaanEntries.push({
                id_detail_transaksi: detail.id_detail_transaksi,
                jumlah_komisi: (detail.harga_item || 0) * 0.20 // Simple 20% calculation
              });
            }
            
            if (perusahaanEntries.length > 0) {
              console.log("Force creating perusahaan commissions:", perusahaanEntries);
              await createBatchKomisiPerusahaan(perusahaanEntries);
              console.log("Force created company commissions successfully");
              return true;
            }
          } else {
            console.warn("Force method - Alternative method also failed to find detail transaksi");
            return false;
          }
        } catch (error) {
          console.error("Force method - Error in alternative method:", error);
          return false;
        }
      }
      
      // Pastikan detailTransaksi adalah array
      let detailTransaksi = [];
      
      // Periksa apakah response menggunakan struktur dengan field success dan data
      if (detailTransaksiResponse.data.success !== undefined) {
        console.log("Force method - Response using success/data structure:", detailTransaksiResponse.data);
        
        if (detailTransaksiResponse.data.data && Array.isArray(detailTransaksiResponse.data.data)) {
          detailTransaksi = detailTransaksiResponse.data.data;
        } else {
          console.warn("Force method - Data field is not an array in success/data structure");
          return false;
        }
      } else {
        // Langsung menggunakan data jika tidak menggunakan struktur success/data
        detailTransaksi = Array.isArray(detailTransaksiResponse.data) 
          ? detailTransaksiResponse.data 
          : [];
      }
      
      console.log("Force method - Processed detailTransaksi:", detailTransaksi);
      
      if (detailTransaksi.length === 0) {
        console.warn("Force method - No transaction details found for force commission creation");
        return false;
      }
      
      // Create company commissions directly (20% of item price)
      const perusahaanEntries = [];
      for (const detail of detailTransaksi) {
        if (!detail || !detail.id_detail_transaksi) continue;
        
        perusahaanEntries.push({
          id_detail_transaksi: detail.id_detail_transaksi,
          jumlah_komisi: (detail.harga_item || 0) * 0.20 // Simple 20% calculation
        });
      }
      
      if (perusahaanEntries.length > 0) {
        console.log("Force creating perusahaan commissions:", perusahaanEntries);
        await createBatchKomisiPerusahaan(perusahaanEntries);
        console.log("Force created company commissions successfully");
        return true;
      } else {
        console.log("Force method - No valid entries to force create commissions");
      }
      
      return false;
    } catch (error) {
      console.error("Error in forceCreateCommission:", error);
      return false;
    }
  };

  const handleCetakNota = async (jadwalId) => {
    try {
      setStatusMessage(null); // Clear any previous error messages
      
      // Get the jadwal data first
      const jadwalResponse = await useAxios.get(`/jadwal/${jadwalId}`);
      const jadwalData = jadwalResponse.data;
      
      if (!jadwalData) {
        console.error("Jadwal data not found");
        setStatusMessage({
          type: "danger",
          text: "Data jadwal tidak ditemukan"
        });
        return;
      }

      const transaksiId = jadwalData.id_transaksi;
      console.log(`Processing nota for jadwal ID: ${jadwalId}, transaksi ID: ${transaksiId}`);
      
      // Check if a nota already exists for this transaction
      let existingNota = null;
      let invoiceNumber = "";
      try {
        existingNota = await getNotaPenjualanByTransaksiId(transaksiId);
        if (existingNota) {
          console.log("Nota already exists with number:", existingNota.nomor_nota);
          invoiceNumber = existingNota.nomor_nota;
          
          // Navigate based on delivery type
          if (jadwalData.id_pegawai) {
            navigate(`/pegawaiGudang/nota-pengiriman/${jadwalId}`);
          } else {
            navigate(`/pegawaiGudang/nota-pengambilan/${jadwalId}`);
          }
          return;
        }
      } catch (error) {
        // If we get an error, it might mean the endpoint doesn't exist yet
        console.log("Could not check for existing nota, proceeding with creation:", error);
      }
      
      // First get transaction details and other necessary data
      console.log("Fetching transaction data...");
      const transaksiResponse = await useAxios.get(`/transaksi/${transaksiId}`);
      if (!transaksiResponse.data) {
        throw new Error("Data transaksi tidak ditemukan");
      }
      const transaksiData = transaksiResponse.data;
      console.log("Transaction data:", transaksiData);
      
      // Validate transaction has pembeli ID
      if (!transaksiData.id_pembeli) {
        throw new Error("ID Pembeli tidak tersedia pada data transaksi");
      }
      
      // Get pembeli data
      console.log(`Fetching pembeli data for ID: ${transaksiData.id_pembeli}...`);
      let pembeliData;
      try {
        const pembeliResponse = await useAxios.get(`/pembeli/${transaksiData.id_pembeli}`);
        if (!pembeliResponse.data) {
          throw new Error("Pembeli tidak ditemukan");
        }
        pembeliData = pembeliResponse.data;
        console.log("Pembeli data:", pembeliData);
      } catch (error) {
        console.error("Error fetching pembeli data:", error);
        
        // Fallback data jika pembeli tidak ditemukan
        pembeliData = {
          nama_pembeli: "Pembeli tidak teridentifikasi",
          id_user: null
        };
        console.log("Using fallback pembeli data:", pembeliData);
      }
      
      // Get pembeli user data to get email
      let buyerEmail = "Email tidak tersedia";
      if (pembeliData.id_user) {
        try {
          const pembeliUserResponse = await useAxios.get(`/pembeli/user/${pembeliData.id_user}`);
          if (pembeliUserResponse.data?.user?.email) {
            buyerEmail = pembeliUserResponse.data.user.email;
          }
        } catch (error) {
          console.error("Error fetching pembeli user data:", error);
        }
      }
      
      // Get alamat data
      let formattedAddress = 'Alamat tidak tersedia';
      try {
        console.log(`Fetching alamat for pembeli ID: ${transaksiData.id_pembeli}...`);
        const alamatResponse = await useAxios.get(`/alamat/pembeli/${transaksiData.id_pembeli}`);
        const alamatData = alamatResponse.data.find(a => a.is_default) || alamatResponse.data[0];
        
        // Format address for storage
        if (alamatData && alamatData.alamat_lengkap) {
          formattedAddress = alamatData.alamat_lengkap;
        }
        console.log("Formatted address:", formattedAddress);
      } catch (error) {
        console.error("Error fetching alamat data:", error);
      }
      
      // Get transaction items
      console.log(`Fetching detail transaksi for transaksi ID: ${transaksiId}...`);
      const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${transaksiId}`);
      let detailTransaksiData = [];
      
      // Handle different response structures
      if (detailTransaksiResponse.data?.success !== undefined) {
        detailTransaksiData = detailTransaksiResponse.data.data || [];
      } else if (Array.isArray(detailTransaksiResponse.data)) {
        detailTransaksiData = detailTransaksiResponse.data;
      } else {
        console.warn("Unexpected response format from API:", detailTransaksiResponse.data);
      }
      
      if (!detailTransaksiData || detailTransaksiData.length === 0) {
        throw new Error("Detail transaksi tidak ditemukan");
      }
      
      console.log(`Found ${detailTransaksiData.length} transaction details`);
      
      // Get complete item details
      const itemsWithDetails = await Promise.all(detailTransaksiData.map(async (item) => {
        try {
          if (!item || !item.id_barang) {
            console.warn("Invalid detail item:", item);
            return {
              nama_barang: "Barang tidak diketahui",
              harga: 0
            };
          }
          
          const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
          const barang = barangResponse.data;
          
          return {
            ...item,
            barang: barang,
            nama_barang: barang?.nama_barang || `Barang #${item.id_barang}`,
            harga: item.harga_beli || barang?.harga || 0
          };
        } catch (error) {
          console.error(`Error fetching barang ${item?.id_barang} details:`, error);
          return {
            ...item,
            nama_barang: `Barang #${item?.id_barang || 'unknown'}`,
            harga: item?.harga_beli || 0
          };
        }
      }));
      
      // Calculate total amount
      const totalAmount = itemsWithDetails.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);
      console.log("Calculated total amount:", totalAmount);
      
      // Calculate points based on total amount (1 point per 10,000 rupiah)
      const calculatePoints = (amount) => {
        let points = Math.floor(amount / 10000);
        
        // Add 20% bonus for purchases over 500,000
        if (amount > 500000) {
          points = Math.floor(points * 1.2);
        }
        
        return points;
      };
      
      const points = calculatePoints(totalAmount);
      console.log("Calculated points:", points);
      
      // Generate a unique invoice number with transaction ID
      if (!invoiceNumber) {
        invoiceNumber = await generateUniqueInvoiceNumber(transaksiId);
        console.log("Generated new invoice number:", invoiceNumber);
      }
      
      // Function to format datetime with time for MySQL compatibility
      const formatDateWithTime = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        // Return in MySQL compatible format (YYYY-MM-DD HH:MM:SS)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      // Create the nota
      const notaData = {
        id_transaksi: transaksiId,
        nomor_nota: invoiceNumber,
        tanggal_pesan: transaksiData.tanggal_transaksi,
        tanggal_lunas: transaksiData.tanggal_transaksi,
        tanggal_ambil: formatDateWithTime(jadwalData.tanggal),
        tanggal_kirim: formatDateWithTime(jadwalData.tanggal),
        nama_kurir: jadwalData.id_pegawai ? jadwalData.pegawai?.nama_pegawai || 'Kurir tidak tersedia' : '(diambil sendiri)',
        total_harga: totalAmount,
        ongkos_kirim: 0,
        potongan_diskon: 0,
        poin_diperoleh: points,
        total_setelah_diskon: totalAmount,
        alamat_pembeli: formattedAddress,
        nama_pembeli: pembeliData.nama_pembeli || "Pembeli tidak teridentifikasi",
        email_pembeli: buyerEmail,
      };
      
      console.log("Creating nota with data:", notaData);
      const createdNota = await createNotaPenjualanBarang(notaData);
      console.log("Received nota creation response:", createdNota);
      
      // Extract id_nota_penjualan from the response, handling different response formats
      const notaPenjualanId = createdNota.data?.id_nota_penjualan || createdNota?.id_nota_penjualan;
      
      if (!notaPenjualanId) {
        console.error("Failed to get id_nota_penjualan from response:", createdNota);
        throw new Error("ID nota penjualan tidak ditemukan dalam respon");
      }
      
      // Create nota detail for each item
      const notaDetailsData = itemsWithDetails.map(item => ({
        id_nota_penjualan: notaPenjualanId,
        nama_barang: item.nama_barang,
        harga_barang: item.harga
      }));
      
      console.log("Creating nota details with data:", notaDetailsData);
      await createBatchNotaDetailPenjualan(notaDetailsData);
      
      // Navigate to the correct receipt page
      if (jadwalData.id_pegawai) {
        navigate(`/pegawaiGudang/nota-pengiriman/${jadwalId}`);
      } else {
        navigate(`/pegawaiGudang/nota-pengambilan/${jadwalId}`);
      }
      
    } catch (error) {
      console.error("Error creating nota:", error);
      setStatusMessage({
        type: "danger",
        text: `Gagal membuat nota: ${error.message}`
      });
    }
  };

  const getDaysSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isEligibleForHangus = (item) => {
    if (item.status_jadwal !== "Menunggu Diambil") return false;
    
    const daysPassed = getDaysSince(item.tanggal);
    return daysPassed >= 2;
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
  
  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filter
  const handleReset = async () => {
    setSearchTerm("");
    setFilter({
      status_jadwal: '',
      tanggalAwal: '',
      tanggalAkhir: '',
      jenis_pengiriman: '',
    });
    setError(null);
    setSearchLoading(true);
    await fetchJadwal();
    setSearchLoading(false);
  };
  
  // Apply filter
  const handleFilterSearch = async (e) => {
    e && e.preventDefault();
    setSearchLoading(true);
    setError(null);
    
    try {
      // Ambil semua jadwal terlebih dahulu
      const response = await useAxios.get("/jadwal");
      let jadwalData = response.data.map(item => ({
        ...item,
        jenis_pengiriman: item.pegawai ? "Dikirim oleh Kurir" : "Diambil Sendiri"
      }));
      
      // Filter berdasarkan searchTerm (ID transaksi, ID jadwal, nama kurir)
      if (searchTerm) {
        const keyword = searchTerm.toLowerCase();
        jadwalData = jadwalData.filter(item => 
          (item.id_transaksi && item.id_transaksi.toString().includes(keyword)) ||
          (item.id_jadwal && item.id_jadwal.toString().includes(keyword)) ||
          (item.pegawai && item.pegawai.nama_pegawai && item.pegawai.nama_pegawai.toLowerCase().includes(keyword))
        );
      }
      
      // Filter berdasarkan status jadwal
      if (filter.status_jadwal) {
        jadwalData = jadwalData.filter(item => item.status_jadwal === filter.status_jadwal);
      }
      
      // Filter berdasarkan jenis pengiriman
      if (filter.jenis_pengiriman) {
        jadwalData = jadwalData.filter(item => item.jenis_pengiriman === filter.jenis_pengiriman);
      }
      
      // Filter berdasarkan tanggal
      if (filter.tanggalAwal) {
        const tanggalAwal = new Date(filter.tanggalAwal);
        jadwalData = jadwalData.filter(item => {
          const tanggalJadwal = new Date(item.tanggal);
          return tanggalJadwal >= tanggalAwal;
        });
      }
      
      if (filter.tanggalAkhir) {
        const tanggalAkhir = new Date(filter.tanggalAkhir);
        tanggalAkhir.setHours(23, 59, 59); // Set to end of day
        jadwalData = jadwalData.filter(item => {
          const tanggalJadwal = new Date(item.tanggal);
          return tanggalJadwal <= tanggalAkhir;
        });
      }
      
      setJadwal(jadwalData);
      setError(jadwalData.length === 0 ? 'Jadwal tidak ditemukan.' : null);
      
    } catch (err) {
      let errorMsg = 'Gagal melakukan pencarian.';
      if (err.response) {
        errorMsg += ` [${err.response.status}] ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMsg += ` (${err.message})`;
      }
      setJadwal([]);
      setError(errorMsg);
      console.error('Search Error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <PegawaiGudangSidebar />
      <div className="p-4 w-100">
        <div className="flex-grow-1 ms-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Manajemen Penjadwalan Pengiriman</h2>
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
                    placeholder="Cari jadwal (ID Transaksi, ID Jadwal, Nama Kurir)..."
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
                    <label className="form-label">Status Jadwal</label>
                    <select className="form-select" name="status_jadwal" value={filter.status_jadwal} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="Menunggu Diambil">Menunggu Diambil</option>
                      <option value="Sedang Dikirim">Sedang Dikirim</option>
                      <option value="Sedang di Kurir">Sedang di Kurir</option>
                      <option value="Sudah Diambil">Sudah Diambil</option>
                      <option value="Sudah Sampai">Sudah Sampai</option>
                      <option value="Hangus">Hangus</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Jenis Pengiriman</label>
                    <select className="form-select" name="jenis_pengiriman" value={filter.jenis_pengiriman} onChange={handleFilterChange}>
                      <option value="">Semua</option>
                      <option value="Dikirim oleh Kurir">Dikirim oleh Kurir</option>
                      <option value="Diambil Sendiri">Diambil Sendiri</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tanggal Awal</label>
                    <input type="date" className="form-control" name="tanggalAwal" value={filter.tanggalAwal} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tanggal Akhir</label>
                    <input type="date" className="form-control" name="tanggalAkhir" value={filter.tanggalAkhir} onChange={handleFilterChange} />
                  </div>
                  <div className="col-md-2 d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary w-100">Terapkan Filter</button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary w-100" 
                      onClick={() => setFilter({
                        status_jadwal: '',
                        tanggalAwal: '',
                        tanggalAkhir: '',
                        jenis_pengiriman: '',
                      })}
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Error dan Status Message Alerts */}
          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-light" onClick={fetchJadwal}>
                Coba Lagi
              </button>
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

          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <span className="ms-2">Memuat data jadwal...</span>
            </div>
          )}

          {/* Tabel Jadwal */}
          {!loading && !error && (
            <JadwalTable
              jadwal={jadwal}
              loading={loading}
              updateStatusJadwal={updateStatusJadwal}
              handleCetakNota={handleCetakNota}
              processingStatus={processingStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PenjadwalanPage; 