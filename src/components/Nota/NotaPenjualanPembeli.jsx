import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../api';
import { useReactToPrint } from 'react-to-print';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, BlobProvider, pdf } from '@react-pdf/renderer';
import { getNotaPenjualanByTransaksiId, generateUniqueInvoiceNumber, createNotaPenjualanBarang } from '../../api/NotaPenjualanBarangApi';
import { createBatchNotaDetailPenjualan } from '../../api/NotaDetailPenjualanApi';

// Define PDF styles
const stylesPdf = StyleSheet.create({
  page: { 
    fontFamily: 'Helvetica', 
    fontSize: 11, 
    padding: 20, 
    lineHeight: 1.5 
  },
  header: { 
    textAlign: 'center',
    marginBottom: 10
  },
  storeName: { 
    fontSize: 14,
    fontWeight: 'bold'
  },
  storeAddress: {
    fontSize: 10,
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  col: {
    flexDirection: 'column'
  },
  label: {
    width: 80,
    fontSize: 10
  },
  value: {
    flex: 1,
    fontSize: 10
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dotted',
    marginVertical: 5
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10
  },
  itemName: {
    flex: 1
  },
  itemPrice: {
    width: 80,
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 3,
    fontSize: 10
  },
  signature: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  signatureBox: {
    width: 150,
    alignItems: 'center'
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: '#000000',
    width: 120,
    marginTop: 40,
    marginBottom: 5
  }
});

// PDF Document Component
const NotaPengambilanDocument = ({ data }) => {
  const { 
    invoiceNumber, 
    jadwal, 
    transaksi, 
    pembeli, 
    buyerEmail, 
    alamat, 
    items, 
    qcOfficer, 
    points,
    currentPoints,
    totalPointsAfterTransaction
  } = data;
  
  // Format date for PDF
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours}:${minutes}`;
  };
  
  // Calculate total
  const totalAmount = items.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);
  
  // Format address
  const formattedAddress = alamat ? 
    [
      alamat.alamat_lengkap
    ].filter(part => part && part.trim() !== '').join(', ') : 
    'Alamat tidak tersedia';
  
  return (
    <Document>
      <Page size="A5" style={stylesPdf.page}>
        {/* Header */}
        <View style={stylesPdf.header}>
          <Text style={stylesPdf.storeName}>ReUse Mart</Text>
          <Text style={stylesPdf.storeAddress}>Jl. Green Eco Park No. 456 Yogyakarta</Text>
        </View>
        
        {/* Invoice Details */}
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>No Nota</Text>
          <Text style={stylesPdf.value}>: {invoiceNumber}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Tanggal pesan</Text>
          <Text style={stylesPdf.value}>: {formatDate(transaksi.tanggal_transaksi)}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Lunas pada</Text>
          <Text style={stylesPdf.value}>: {formatDate(transaksi.tanggal_transaksi)}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Tanggal ambil</Text>
          <Text style={stylesPdf.value}>: {formatDate(jadwal.tanggal)}</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* Customer Details */}
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Pembeli</Text>
          <Text style={stylesPdf.value}>: {buyerEmail} / {pembeli.nama_pembeli}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Alamat</Text>
          <Text style={stylesPdf.value}>: {formattedAddress}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Delivery</Text>
          <Text style={stylesPdf.value}>: (diambil sendiri)</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* Items */}
        {items.map((item, index) => {
          const subtotal = item.harga * (item.jumlah || 1);
          return (
            <View style={stylesPdf.itemRow} key={index}>
              <Text style={stylesPdf.itemName}>{item.nama_barang}</Text>
              <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(subtotal)}</Text>
            </View>
          );
        })}
        
        <View style={stylesPdf.divider} />
        
        {/* Totals */}
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Total</Text>
          <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(totalAmount)}</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Ongkos Kirim</Text>
          <Text style={stylesPdf.itemPrice}>0</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Total</Text>
          <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(totalAmount)}</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Poin dari pesanan ini</Text>
          <Text style={stylesPdf.itemPrice}>{points}</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Poin Pembeli saat ini</Text>
          <Text style={stylesPdf.itemPrice}>{currentPoints}</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Total poin pembeli setelah transaksi</Text>
          <Text style={stylesPdf.itemPrice}>{totalPointsAfterTransaction}</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* QC Officer */}
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>QC oleh: {qcOfficer}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Diambil oleh:</Text>
        </View>
        
        {/* Signature */}
        <View style={stylesPdf.signature}>
          <View style={stylesPdf.signatureBox}>
            <Text style={stylesPdf.signatureLine}></Text>
            <Text style={{fontSize: 10}}>Tanggal: ...............................</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const NotaPenjualanPembeli = () => {
  const { id_jadwal } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notaData, setNotaData] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const printRef = useRef();
  const navigate = useNavigate();
  // Add a ref to track if we've attempted to create a nota
  const notaCreationAttempted = useRef(false);

  // Format date to DD/MM/YYYY with time
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours}:${minutes}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate points based on total amount (1 point per 10,000 rupiah)
  const calculatePoints = (totalAmount) => {
    // Base points: 1 point per 10,000 rupiah
    let points = Math.floor(totalAmount / 10000);
    
    // Add 20% bonus for purchases over 500,000
    if (totalAmount > 500000) {
      points = Math.floor(points * 1.2); // Add 20% bonus
    }
    
    return points;
  };

  // Generate PDF function
  const generatePDF = async (data) => {
    try {
      if (!data) {
        console.log("[NOTA PEMBELI] No data available for PDF generation");
        setPdfError("Tidak ada data untuk membuat PDF");
        return;
      }
      
      console.log("[NOTA PEMBELI] Starting PDF generation with invoice number:", data.invoiceNumber);
      console.log("[NOTA PEMBELI] PDF data:", {
        invoiceNumber: data.invoiceNumber,
        jadwalId: data.jadwal?.id_jadwal,
        transaksiId: data.transaksi?.id_transaksi,
        pembeliName: data.pembeli?.nama_pembeli,
        totalItems: data.items?.length || 0,
        totalAmount: data.items?.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0) || 0
      });
      
      const blob = await pdf(<NotaPengambilanDocument data={data} />).toBlob();
      console.log("[NOTA PEMBELI] PDF blob created successfully");
      setPdfBlob(blob);
      setIsPdfReady(true);
      setPdfError(null);
      console.log("[NOTA PEMBELI] PDF generation completed successfully");
    } catch (err) {
      console.error("[NOTA PEMBELI] Error generating PDF:", err);
      setPdfError(`Gagal membuat PDF: ${err.message}`);
    }
  };

  // Handle direct download
  const handleDownloadPDF = () => {
    if (!pdfBlob) {
      generatePDF(notaData);
      return;
    }
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nota_Pengambilan_${id_jadwal}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchNotaData = async () => {
      setLoading(true);
      console.log(`[NOTA PEMBELI] Starting fetchNotaData for jadwal ID: ${id_jadwal}`);
      try {
        // Initialize variables here to prevent "Cannot access before initialization" errors
        let buyerEmail = "Email tidak tersedia";
        let currentPoints = 0;
        let invoiceNumber = "";

        // Step 1: Get jadwal data
        console.log(`[NOTA PEMBELI] Fetching jadwal data for ID: ${id_jadwal}`);
        const jadwalResponse = await useAxios.get(`/jadwal/${id_jadwal}`);
        const jadwalData = jadwalResponse.data;
        console.log(`[NOTA PEMBELI] Jadwal data:`, jadwalData);

        // Verify this is a self-pickup transaction (id_pegawai should be null)
        if (jadwalData.id_pegawai !== null) {
          console.log(`[NOTA PEMBELI] This is not a self-pickup transaction. id_pegawai: ${jadwalData.id_pegawai}`);
          setError('Ini bukan transaksi pengambilan mandiri.');
          setLoading(false);
          return;
        }

        // Step 2: Get transaction data
        console.log(`[NOTA PEMBELI] Fetching transaction data for ID: ${jadwalData.id_transaksi}`);
        const transaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}`);
        const transaksiData = transaksiResponse.data;
        console.log(`[NOTA PEMBELI] Transaction data:`, transaksiData);

        // Step 2.5: Get nota penjualan data if it exists
        try {
          console.log(`[NOTA PEMBELI] Checking if nota exists for transaction ID: ${transaksiData.id_transaksi}`);
          const notaPenjualan = await getNotaPenjualanByTransaksiId(transaksiData.id_transaksi);
          if (notaPenjualan) {
            invoiceNumber = notaPenjualan.nomor_nota;
            console.log(`[NOTA PEMBELI] Found existing nota with number: ${invoiceNumber}`, notaPenjualan);
          } else {
            console.log("[NOTA PEMBELI] No existing nota found, will create a new one for self-pickup transaction");
            
            // Check if we've already attempted to create a nota in this component lifecycle
            if (!notaCreationAttempted.current) {
              notaCreationAttempted.current = true;
              console.log("[NOTA PEMBELI] First attempt to create nota in this component lifecycle");
              
              try {
                // Get transaction details to calculate total
                console.log(`[NOTA PEMBELI] Fetching transaction details for ID: ${transaksiData.id_transaksi}`);
                const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${transaksiData.id_transaksi}`);
                // Ensure detailTransaksiData is always an array
                const detailTransaksiData = Array.isArray(detailTransaksiResponse.data) ? 
                  detailTransaksiResponse.data : 
                  (detailTransaksiResponse.data ? [detailTransaksiResponse.data] : []);
                console.log(`[NOTA PEMBELI] Transaction details:`, detailTransaksiData);
                
                // Get item details to calculate total
                console.log(`[NOTA PEMBELI] Fetching item details for ${detailTransaksiData.length} items`);
                const itemDetails = await Promise.all(detailTransaksiData.map(async (item) => {
                  try {
                    const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
                    const barang = barangResponse.data;
                    
                    return {
                      ...item,
                      harga: item.harga_beli || barang?.harga || 0,
                      nama_barang: barang?.nama_barang || `Barang #${item.id_barang}`
                    };
                  } catch (error) {
                    console.error(`[NOTA PEMBELI] Error fetching barang ${item?.id_barang}:`, error);
                    return {
                      ...item,
                      harga: item?.harga_beli || 0,
                      nama_barang: `Barang #${item?.id_barang || 'unknown'}`
                    };
                  }
                }));
                console.log(`[NOTA PEMBELI] Item details:`, itemDetails);
                
                // Calculate total amount
                const totalAmount = itemDetails.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);
                console.log(`[NOTA PEMBELI] Calculated total amount: ${totalAmount}`);
                const points = calculatePoints(totalAmount);
                console.log(`[NOTA PEMBELI] Calculated points: ${points}`);
                
                // Generate a unique invoice number with transaction ID
                console.log(`[NOTA PEMBELI] Generating invoice number for transaction ID: ${transaksiData.id_transaksi}`);
                const newInvoiceNumber = await generateUniqueInvoiceNumber(transaksiData.id_transaksi);
                console.log(`[NOTA PEMBELI] Generated invoice number: ${newInvoiceNumber}`);

                // Format address
                console.log(`[NOTA PEMBELI] Fetching address for pembeli ID: ${transaksiData.id_pembeli}`);
                const alamatResponse = await useAxios.get(`/alamat/pembeli/${transaksiData.id_pembeli}`);
                const alamatData = alamatResponse.data.find(a => a.is_default) || alamatResponse.data[0];
                const formattedAddress = alamatData ? alamatData.alamat_lengkap : 'Alamat tidak tersedia';
                console.log(`[NOTA PEMBELI] Formatted address: ${formattedAddress}`);

                // Get buyer email
                console.log(`[NOTA PEMBELI] Fetching pembeli data for ID: ${transaksiData.id_pembeli}`);
                const pembeliResponse = await useAxios.get(`/pembeli/${transaksiData.id_pembeli}`);
                const pembeliData = pembeliResponse.data;
                console.log(`[NOTA PEMBELI] Pembeli data:`, pembeliData);
                // Use the already initialized buyerEmail variable
                
                if (pembeliData && pembeliData.id_user) {
                  try {
                    console.log(`[NOTA PEMBELI] Fetching user data for pembeli user ID: ${pembeliData.id_user}`);
                    const pembeliUserResponse = await useAxios.get(`/pembeli/user/${pembeliData.id_user}`);
                    if (pembeliUserResponse.data?.user?.email) {
                      buyerEmail = pembeliUserResponse.data.user.email;
                      console.log(`[NOTA PEMBELI] Found buyer email: ${buyerEmail}`);
                    } else {
                      // Provide a valid email when missing
                      buyerEmail = "no-email@example.com";
                      console.log(`[NOTA PEMBELI] No email found in user data, using default: ${buyerEmail}`);
                    }
                  } catch (error) {
                    console.error("[NOTA PEMBELI] Error fetching pembeli user data:", error);
                    buyerEmail = "no-email@example.com";
                    console.log(`[NOTA PEMBELI] Error getting email, using default: ${buyerEmail}`);
                  }
                } else {
                  buyerEmail = "no-email@example.com";
                  console.log(`[NOTA PEMBELI] No pembeli user ID available, using default email: ${buyerEmail}`);
                }

                // Format datetime with time for MySQL compatibility
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

                // Create nota data
                console.log(`[NOTA PEMBELI] Creating nota data object with invoice number: ${newInvoiceNumber}`);
                const notaData = {
                  id_transaksi: transaksiData.id_transaksi,
                  nomor_nota: newInvoiceNumber,
                  tanggal_pesan: transaksiData.tanggal_transaksi,
                  tanggal_lunas: transaksiData.tanggal_transaksi,
                  tanggal_ambil: formatDateWithTime(jadwalData.tanggal),
                  tanggal_kirim: formatDateWithTime(jadwalData.tanggal),
                  nama_kurir: "(diambil sendiri)",
                  total_harga: totalAmount,
                  ongkos_kirim: 0,
                  potongan_diskon: 0,
                  poin_diperoleh: points,
                  total_setelah_diskon: totalAmount,
                  alamat_pembeli: formattedAddress,
                  nama_pembeli: pembeliData.nama_pembeli,
                  email_pembeli: buyerEmail
                };
                
                console.log("[NOTA PEMBELI] Creating nota with data:", notaData);
                const createdNota = await createNotaPenjualanBarang(notaData);
                console.log("[NOTA PEMBELI] Created nota response:", createdNota);
                
                // Extract id_nota_penjualan from the response, handling different response formats
                const notaPenjualanId = createdNota.data?.id_nota_penjualan || createdNota?.id_nota_penjualan;
                console.log(`[NOTA PEMBELI] Extracted nota ID: ${notaPenjualanId}`);
                
                if (!notaPenjualanId) {
                  console.error("[NOTA PEMBELI] Failed to get id_nota_penjualan from response:", createdNota);
                  setError("ID nota penjualan tidak ditemukan dalam respon");
                  setLoading(false);
                  return;
                }
                
                // Create nota detail entries for each item
                const notaDetailsData = itemDetails.map(item => ({
                  id_nota_penjualan: notaPenjualanId,
                  nama_barang: item.nama_barang,
                  harga_barang: item.harga
                }));
                
                console.log("[NOTA PEMBELI] Creating nota details with data:", notaDetailsData);
                await createBatchNotaDetailPenjualan(notaDetailsData);
                console.log("[NOTA PEMBELI] Nota details created successfully");
                
                invoiceNumber = newInvoiceNumber;
              } catch (createError) {
                console.error("[NOTA PEMBELI] Error in nota creation process:", createError);
                
                // Try one more time to check if a nota was actually created despite the error
                try {
                  console.log(`[NOTA PEMBELI] Rechecking if nota exists after error for transaction ID: ${transaksiData.id_transaksi}`);
                  const recheckNota = await getNotaPenjualanByTransaksiId(transaksiData.id_transaksi);
                  if (recheckNota) {
                    console.log("[NOTA PEMBELI] Found nota on recheck after error:", recheckNota);
                    invoiceNumber = recheckNota.nomor_nota;
                  } else {
                    console.log("[NOTA PEMBELI] No nota found on recheck after error");
                    setError('Gagal membuat nota baru. Detail: ' + createError.message);
                    setLoading(false);
                    return;
                  }
                } catch (recheckError) {
                  console.error("[NOTA PEMBELI] Error during recheck after nota creation error:", recheckError);
                  setError('Gagal membuat nota baru. Detail: ' + createError.message);
                  setLoading(false);
                  return;
                }
              }
            } else {
              // If we've already attempted to create a nota, try to fetch it again
              // This handles the case where the first attempt succeeded but the response wasn't processed
              console.log("[NOTA PEMBELI] Already attempted to create nota, checking one more time");
              const recheckNota = await getNotaPenjualanByTransaksiId(transaksiData.id_transaksi);
              if (recheckNota) {
                console.log("[NOTA PEMBELI] Found nota on additional check:", recheckNota);
                invoiceNumber = recheckNota.nomor_nota;
              } else {
                console.log("[NOTA PEMBELI] No nota found on additional check, creating fallback invoice number");
                // Generate a fallback invoice number for display
                const now = new Date();
                const year = now.getFullYear().toString().slice(-2);
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                // Add null check for transaksiData.id_transaksi
                const transactionId = transaksiData && transaksiData.id_transaksi ? 
                  transaksiData.id_transaksi.toString().padStart(3, '0') : 
                  Math.floor(Math.random() * 999).toString().padStart(3, '0');
                // Add a random suffix to avoid collisions
                const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                invoiceNumber = `${year}.${month}.${transactionId}-${randomSuffix}`;
                console.log(`[NOTA PEMBELI] Using fallback invoice number: ${invoiceNumber}`);
              }
            }
          }
        } catch (error) {
          console.error("[NOTA PEMBELI] Error in nota fetching/creation main process:", error);
          // Set fallback invoice number if everything fails
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          // Add null check for transaksiData.id_transaksi
          const transactionId = transaksiData && transaksiData.id_transaksi ? 
            transaksiData.id_transaksi.toString().padStart(3, '0') : 
            Math.floor(Math.random() * 999).toString().padStart(3, '0');
          // Add a random suffix to avoid collisions
          const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          invoiceNumber = `${year}.${month}.${transactionId}-${randomSuffix}`;
          console.log(`[NOTA PEMBELI] Using fallback invoice number after error: ${invoiceNumber}`);
        }

        // Step 3: Get pembeli data to get the id_user
        let pembeliData = { nama_pembeli: "Pembeli tidak teridentifikasi", id_user: null };
        try {
          if (transaksiData && transaksiData.id_pembeli) {
            console.log(`[NOTA PEMBELI] Fetching pembeli data for ID: ${transaksiData.id_pembeli}`);
            const pembeliResponse = await useAxios.get(`/pembeli/${transaksiData.id_pembeli}`);
            pembeliData = pembeliResponse.data || pembeliData;
            console.log("[NOTA PEMBELI] Pembeli data:", pembeliData);
          } else {
            console.log("[NOTA PEMBELI] No pembeli ID available in transaction data, using default");
          }
        } catch (error) {
          console.error("[NOTA PEMBELI] Error fetching pembeli data:", error);
        }

        // Step 4: Get the user email using the pembeli/user endpoint
        if (pembeliData.id_user) {
          try {
            console.log(`[NOTA PEMBELI] Fetching user data for pembeli user ID: ${pembeliData.id_user}`);
            const pembeliUserResponse = await useAxios.get(`/pembeli/user/${pembeliData.id_user}`);
            console.log("[NOTA PEMBELI] Pembeli user response:", pembeliUserResponse.data);
            
            // Extract email from the nested user object
            if (pembeliUserResponse.data && 
                pembeliUserResponse.data.user && 
                pembeliUserResponse.data.user.email) {
              buyerEmail = pembeliUserResponse.data.user.email;
              console.log(`[NOTA PEMBELI] Found buyer email: ${buyerEmail}`);
            } else {
              console.log("[NOTA PEMBELI] No valid email found in user data, using default");
            }
            
            // Get the customer's current points
            if (pembeliUserResponse.data && 
                typeof pembeliUserResponse.data.jumlah_poin !== 'undefined') {
              currentPoints = pembeliUserResponse.data.jumlah_poin || 0;
              console.log(`[NOTA PEMBELI] Found customer's current points: ${currentPoints}`);
            } else {
              console.log("[NOTA PEMBELI] No points data found, using default (0)");
            }
          } catch (error) {
            console.error("[NOTA PEMBELI] Error fetching pembeli/user data:", error);
          }
        } else {
          console.log("[NOTA PEMBELI] No pembeli user ID available, skipping user data fetch");
        }

        // Step 5: Get address data
        let alamatData = null;
        try {
          if (transaksiData && transaksiData.id_pembeli) {
            console.log(`[NOTA PEMBELI] Fetching alamat for pembeli ID: ${transaksiData.id_pembeli}`);
            const alamatResponse = await useAxios.get(`/alamat/pembeli/${transaksiData.id_pembeli}`);
            if (Array.isArray(alamatResponse.data) && alamatResponse.data.length > 0) {
              alamatData = alamatResponse.data.find(a => a.is_default) || alamatResponse.data[0];
              console.log("[NOTA PEMBELI] Found address:", alamatData);
            } else {
              console.log("[NOTA PEMBELI] No address data found");
            }
          } else {
            console.log("[NOTA PEMBELI] No pembeli ID available, skipping address fetch");
          }
        } catch (error) {
          console.error("[NOTA PEMBELI] Error fetching alamat data:", error);
        }

        // Step 6: Get transaction items
        let detailTransaksiData2 = [];
        try {
          if (transaksiData && transaksiData.id_transaksi) {
            console.log(`[NOTA PEMBELI] Fetching transaction details for ID: ${transaksiData.id_transaksi}`);
            const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${transaksiData.id_transaksi}`);
            if (detailTransaksiResponse && detailTransaksiResponse.data) {
              // Ensure we always have an array
              detailTransaksiData2 = Array.isArray(detailTransaksiResponse.data) ? 
                detailTransaksiResponse.data : 
                (detailTransaksiResponse.data ? [detailTransaksiResponse.data] : []);
              console.log(`[NOTA PEMBELI] Found ${detailTransaksiData2.length} transaction details:`, detailTransaksiData2);
            } else {
              console.log("[NOTA PEMBELI] No transaction details data found");
            }
          } else {
            console.log("[NOTA PEMBELI] No transaction ID available, skipping details fetch");
          }
        } catch (error) {
          console.error("[NOTA PEMBELI] Error fetching transaction details:", error);
        }

        // Step 7: Get complete item details
        let itemsWithDetails = [];
        try {
          if (Array.isArray(detailTransaksiData2) && detailTransaksiData2.length > 0) {
            console.log(`[NOTA PEMBELI] Processing ${detailTransaksiData2.length} items for details`);
            itemsWithDetails = await Promise.all(detailTransaksiData2.map(async (item) => {
              try {
                if (!item || !item.id_barang) {
                  console.log("[NOTA PEMBELI] Invalid item without id_barang:", item);
                  return {
                    nama_barang: "Barang tidak valid",
                    harga: 0,
                    nama_petugas_qc: "Tidak tersedia"
                  };
                }

                console.log(`[NOTA PEMBELI] Fetching barang details for ID: ${item.id_barang}`);
                const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
                const barang = barangResponse.data;
                
                // Fetch penitipan data to get nama_petugas_qc
                let namaPetugasQC = "Tidak tersedia";
                try {
                  console.log(`[NOTA PEMBELI] Fetching penitipan data for barang ID: ${item.id_barang}`);
                  const penitipanResponse = await useAxios.get(`/penitipanBarang/barang/${item.id_barang}`);
                  if (penitipanResponse.data && penitipanResponse.data.nama_petugas_qc) {
                    namaPetugasQC = penitipanResponse.data.nama_petugas_qc;
                    console.log(`[NOTA PEMBELI] Found QC officer: ${namaPetugasQC}`);
                  } else {
                    console.log("[NOTA PEMBELI] No QC officer found in penitipan data");
                  }
                } catch (penitipanError) {
                  console.error(`[NOTA PEMBELI] Error fetching penitipan for barang ${item.id_barang}:`, penitipanError);
                }
                
                const itemDetail = {
                  ...item,
                  barang: barang,
                  nama_barang: barang?.nama_barang || `Barang #${item.id_barang}`,
                  harga: item.harga_beli || barang?.harga || 0,
                  nama_petugas_qc: namaPetugasQC
                };
                console.log(`[NOTA PEMBELI] Processed item detail:`, itemDetail);
                return itemDetail;
              } catch (error) {
                console.error(`[NOTA PEMBELI] Error fetching barang details:`, error);
                return {
                  ...item,
                  nama_barang: item && item.id_barang ? `Barang #${item.id_barang}` : "Barang tidak diketahui",
                  harga: item && item.harga_beli ? item.harga_beli : 0,
                  nama_petugas_qc: "Tidak tersedia"
                };
              }
            }));
            console.log(`[NOTA PEMBELI] Processed ${itemsWithDetails.length} items with details`);
          } else {
            console.log("[NOTA PEMBELI] No items to process for details");
          }
        } catch (error) {
          console.error("[NOTA PEMBELI] Error processing item details:", error);
          itemsWithDetails = [];
        }

        // Fetch QC officer name for display at the top level
        let qcOfficer = "Tidak tersedia";
        if (itemsWithDetails.length > 0 && itemsWithDetails[0].nama_petugas_qc) {
          qcOfficer = itemsWithDetails[0].nama_petugas_qc;
          console.log(`[NOTA PEMBELI] Using QC officer for display: ${qcOfficer}`);
        } else {
          console.log("[NOTA PEMBELI] No QC officer available for display");
        }

        // Calculate total and points
        const totalAmount = itemsWithDetails.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0) || 0;
        console.log(`[NOTA PEMBELI] Calculated final total amount: ${totalAmount}`);
        const points = calculatePoints(totalAmount);
        console.log(`[NOTA PEMBELI] Calculated final points: ${points}`);
        const totalPointsAfterTransaction = (currentPoints || 0) + points;
        console.log(`[NOTA PEMBELI] Total points after transaction: ${totalPointsAfterTransaction}`);

        // Compile all data
        // Ensure we have an invoice number, if not create a fallback
        if (!invoiceNumber) {
          console.log("[NOTA PEMBELI] No invoice number available, creating fallback");
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          // Add null check for transaksiData.id_transaksi
          const transactionId = transaksiData && transaksiData.id_transaksi ? 
            transaksiData.id_transaksi.toString().padStart(3, '0') : 
            Math.floor(Math.random() * 999).toString().padStart(3, '0');
          // Add a random suffix for uniqueness
          const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          invoiceNumber = `${year}.${month}.${transactionId}-${randomSuffix}`;
          console.log(`[NOTA PEMBELI] Created final fallback invoice number: ${invoiceNumber}`);
        }

        console.log(`[NOTA PEMBELI] Preparing final nota data with invoice number: ${invoiceNumber}`);
        setNotaData({
          invoiceNumber: invoiceNumber,
          jadwal: jadwalData,
          transaksi: transaksiData,
          pembeli: pembeliData,
          buyerEmail: buyerEmail,
          alamat: alamatData,
          items: itemsWithDetails,
          qcOfficer: qcOfficer,
          points: points,
          currentPoints: currentPoints,
          totalPointsAfterTransaction: totalPointsAfterTransaction
        });

        console.log(`[NOTA PEMBELI] Final nota data prepared with invoice number: ${invoiceNumber}`);
        setLoading(false);
      } catch (error) {
        console.error('[NOTA PEMBELI] Error fetching nota data:', error);
        setError('Gagal memuat data nota. Silakan coba lagi.');
        setLoading(false);
      }
    };

    if (id_jadwal) {
      fetchNotaData();
    } else {
      setError('ID Jadwal tidak ditemukan.');
      setLoading(false);
    }
  }, [id_jadwal]);

  // After data is loaded, generate the PDF
  useEffect(() => {
    if (notaData && !isPdfReady && !pdfBlob) {
      generatePDF(notaData);
    }
  }, [notaData, isPdfReady, pdfBlob]);

  // Printing functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nota_Pengambilan_${id_jadwal}`,
  });

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data nota...</p>
      </Container>
    );
  }

  if (error || !notaData) {
    return (
      <Container className="my-5">
        <Card className="shadow">
          <Card.Body className="text-center">
            <Card.Title className="text-danger">Error</Card.Title>
            <Card.Text>{error || 'Terjadi kesalahan saat memuat data.'}</Card.Text>
            <Button variant="primary" onClick={() => navigate(-1)}>Kembali</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const { invoiceNumber, jadwal, transaksi, pembeli, buyerEmail, alamat, items, qcOfficer, points, currentPoints, totalPointsAfterTransaction } = notaData || {};
  const totalAmount = items?.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0) || 0;

  console.log("Rendering receipt with invoice number:", invoiceNumber);

  // Format address for display
  const formattedAddress = alamat ? 
    [
      alamat.alamat_lengkap
    ].filter(part => part && part.trim() !== '').join(', ') : 
    'Alamat tidak tersedia';

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Nota Pengambilan Mandiri</h2>
        <div>
          {pdfError && (
            <Alert variant="danger" className="mb-2 p-2 small">
              {pdfError}
            </Alert>
          )}
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF}
            disabled={loading || !notaData} 
            className="me-2"
          >
            {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </div>

      <Card className="shadow mb-4" ref={printRef}>
        <Card.Body className="p-4" style={{maxWidth: '480px', margin: '0 auto'}}>
          <div className="text-center mb-3">
            <h5 className="mb-0 fw-bold">ReUse Mart</h5>
            <p className="small mb-0">Jl. Green Eco Park No. 456 Yogyakarta</p>
          </div>

          <div className="mb-3">
            <div className="d-flex">
              <div style={{width: '120px'}}>No Nota</div>
              <div>: {invoiceNumber}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Tanggal pesan</div>
              <div>: {formatDate(transaksi.tanggal_transaksi)}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Lunas pada</div>
              <div>: {formatDate(transaksi.tanggal_transaksi)}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Tanggal ambil</div>
              <div>: {formatDate(jadwal.tanggal)}</div>
            </div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          <div className="mb-3">
            <div className="d-flex">
              <div style={{width: '120px'}}>Pembeli</div>
              <div>: {buyerEmail} / {pembeli.nama_pembeli}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Alamat</div>
              <div className="text-wrap">: {formattedAddress}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Delivery</div>
              <div>: (diambil sendiri)</div>
            </div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* Items */}
          {items.map((item, index) => (
            <div className="d-flex justify-content-between mb-1" key={index}>
              <div>{item.nama_barang}</div>
              <div>{formatCurrency(item.harga * (item.jumlah || 1))}</div>
            </div>
          ))}

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* Totals */}
          <div className="d-flex justify-content-between mb-1">
            <div>Total</div>
            <div>{formatCurrency(totalAmount)}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Ongkos Kirim</div>
            <div>0</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Total</div>
            <div>{formatCurrency(totalAmount)}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Poin dari pesanan ini</div>
            <div>{points}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Poin Pembeli saat ini</div>
            <div>{currentPoints}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Total poin pembeli setelah transaksi</div>
            <div>{totalPointsAfterTransaction}</div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* QC Officer */}
          <div className="mb-1">QC oleh: {qcOfficer}</div>
          <div className="mb-2">Diambil oleh:</div>

          {/* Signature */}
          <div className="text-end" style={{marginTop: '40px'}}>
            <div style={{width: '150px', display: 'inline-block', textAlign: 'center'}}>
              <div style={{borderBottom: '1px dotted #000', marginBottom: '5px'}}>&nbsp;</div>
              <div>Tanggal: ...............................</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotaPenjualanPembeli;
