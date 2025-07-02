import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../api';
import { useReactToPrint } from 'react-to-print';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, BlobProvider, pdf } from '@react-pdf/renderer';
import { getNotaPenjualanByTransaksiId } from '../../api/NotaPenjualanBarangApi';
import { getAlamatByPembeliId } from '../../api/AlamatApi';

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
const NotaPengirimanDocument = ({ data }) => {
  const { 
    invoiceNumber, 
    jadwal, 
    transaksi, 
    pegawai, 
    pembeli, 
    buyerEmail, 
    alamat, 
    items, 
    qcOfficer, 
    points,
    currentPoints,
    totalPointsAfterTransaction
  } = data;
  
  // Format date to DD/MM/YYYY with time
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours}:${minutes}`;
  };
  
  // Format the display email
  const displayEmail = (pembeli && pembeli.user && pembeli.user.email) ? 
    pembeli.user.email : (buyerEmail || "Email tidak tersedia");
  
  // Calculate total with proper parsing
  const totalAmount = items.reduce((sum, item) => {
    const itemPrice = parseFloat(item.harga) || 0;
    const itemQty = parseInt(item.jumlah) || 1;
    return sum + (itemPrice * itemQty);
  }, 0);
  
  // Get shipping cost from transaction data
  const shippingCost = transaksi.biaya_pengiriman || 0;
  
  // Calculate grand total
  const grandTotal = totalAmount + shippingCost;
  
  // Format address
  const formattedAddress = alamat ? 
    [
      alamat.alamat_lengkap || "- Alamat tidak tersedia -"
    ].filter(part => part && part.trim() !== '').join(', ') : 
    '- Alamat tidak tersedia -';
  
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
          <Text style={stylesPdf.value}>: {displayEmail} / {pembeli.nama_pembeli || "Nama tidak tersedia"}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Alamat</Text>
          <Text style={stylesPdf.value}>: {formattedAddress}</Text>
        </View>
        <View style={stylesPdf.row}>
          <Text style={stylesPdf.label}>Delivery</Text>
          <Text style={stylesPdf.value}>: Kurir ReUseMart ({pegawai?.nama_pegawai || 'Tidak tersedia'})</Text>
        </View>
        
        <View style={stylesPdf.divider} />
        
        {/* Items */}
        {items.map((item, index) => {
          const itemPrice = parseFloat(item.harga) || 0;
          const itemQty = parseInt(item.jumlah) || 1;
          const itemTotal = itemPrice * itemQty;
          const displayName = item.nama_barang + (itemQty > 1 ? ` (${itemQty})` : '');
          
          return (
            <View style={stylesPdf.itemRow} key={index}>
              <Text style={stylesPdf.itemName}>{displayName}</Text>
              <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(itemTotal)}</Text>
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
          <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(shippingCost)}</Text>
        </View>
        <View style={stylesPdf.totalRow}>
          <Text style={stylesPdf.itemName}>Total</Text>
          <Text style={stylesPdf.itemPrice}>{new Intl.NumberFormat('id-ID').format(grandTotal)}</Text>
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

const NotaPenjualanKurir = () => {
  const { id_jadwal } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notaData, setNotaData] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const printRef = useRef();
  const navigate = useNavigate();

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
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return 0;
    }
    
    // Make sure we're working with a number
    const amount = parseFloat(totalAmount);
    
    // Base points: 1 point per 10,000 rupiah
    let points = Math.floor(amount / 10000);
    
    // Add 20% bonus for purchases over 500,000
    if (amount > 500000) {
      points = Math.floor(points * 1.2); // Add 20% bonus
    }
    
    return Math.max(0, points); // Ensure we return a non-negative integer
  };

  // Generate PDF function
  const generatePDF = async (data) => {
    try {
      if (!data) {
        setPdfError("Tidak ada data untuk membuat PDF");
        return;
      }
      
      // Make sure we have at least a minimal address
      if (!data.alamat || !data.alamat.alamat_lengkap || data.alamat.alamat_lengkap.trim() === '') {
        console.log("No valid address found, using fallback for PDF");
        data.alamat = {
          alamat_lengkap: "- Alamat tidak tersedia -",
          is_default: true
        };
      }
      
      console.log("Generating PDF with invoice number:", data.invoiceNumber);
      
      const blob = await pdf(<NotaPengirimanDocument data={data} />).toBlob();
      setPdfBlob(blob);
      setIsPdfReady(true);
      setPdfError(null);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setPdfError(`Gagal membuat PDF: ${err.message}`);
    }
  };

  // Handle direct download
  const handleDownloadPDF = () => {
    if (!pdfBlob) {
      try {
        // Make sure notaData has a valid address
        const dataToUse = { ...notaData };
        if (!dataToUse.alamat || !dataToUse.alamat.alamat_lengkap || dataToUse.alamat.alamat_lengkap.trim() === '') {
          dataToUse.alamat = {
            alamat_lengkap: "- Alamat tidak tersedia -",
            is_default: true
          };
        }
        
        generatePDF(dataToUse);
        return;
      } catch (error) {
        console.error("Error preparing PDF data:", error);
        setPdfError(`Gagal menyiapkan data PDF: ${error.message}`);
        return;
      }
    }
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nota_Pengiriman_${id_jadwal}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchNotaData = async () => {
      setLoading(true);
      try {
        // Initialize variables for user data
        let buyerEmail = "Email tidak tersedia";
        let currentPoints = 0; // Initialize current points
        
        // Step 1: Get jadwal data
        console.log("Fetching jadwal data for ID:", id_jadwal);
        const jadwalResponse = await useAxios.get(`/jadwal/${id_jadwal}`);
        const jadwalData = jadwalResponse.data;
        console.log("Jadwal data:", jadwalData);
        
        if (!jadwalData || !jadwalData.id_transaksi) {
          throw new Error("Jadwal tidak memiliki ID transaksi yang valid");
        }

        // Step 2: Get transaction data
        console.log("Fetching transaction data for ID:", jadwalData.id_transaksi);
        const transaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}`);
        const transaksiData = transaksiResponse.data;
        console.log("Transaksi data full response:", transaksiData);
        
        // Handle both possible API response formats
        // Some APIs return { data: { actual_data } } while others return { actual_data } directly
        let actualTransaksiData = transaksiData;
        if (transaksiData && transaksiData.data && typeof transaksiData.data === 'object') {
          actualTransaksiData = transaksiData.data;
          console.log("Using nested transaction data:", actualTransaksiData);
        }
        
        if (!actualTransaksiData || !actualTransaksiData.id_pembeli) {
          console.error("Transaction data doesn't contain pembeli ID");
          console.log("Trying alternative approach to get pembeli");
          
          // Try fetching transaction with specific include parameter to get pembeli
          try {
            const detailedTransaksiResponse = await useAxios.get(`/transaksi/${jadwalData.id_transaksi}?include=pembeli`);
            console.log("Detailed transaction response:", detailedTransaksiResponse.data);
            
            if (detailedTransaksiResponse.data && detailedTransaksiResponse.data.id_pembeli) {
              actualTransaksiData = detailedTransaksiResponse.data;
              console.log("Found pembeli ID in detailed transaction data:", actualTransaksiData.id_pembeli);
            } else if (detailedTransaksiResponse.data && detailedTransaksiResponse.data.pembeli && detailedTransaksiResponse.data.pembeli.id_pembeli) {
              actualTransaksiData.id_pembeli = detailedTransaksiResponse.data.pembeli.id_pembeli;
              console.log("Found pembeli ID in nested pembeli object:", actualTransaksiData.id_pembeli);
            } else {
              // As a last resort, try to find any transaction detail
              console.log("Attempting to get transaction details to find pembeli ID");
              const detailResponse = await useAxios.get(`/detailTransaksi/transaksi/${jadwalData.id_transaksi}`);
              console.log("Detail transaction response:", detailResponse.data);
              
              // Try to find pembeli ID in detail response (if available in your API structure)
            }
          } catch (alternativeError) {
            console.error("Alternative approach failed:", alternativeError);
          }
        }

        // For development/testing, if we still don't have pembeli ID, use a placeholder
        if (!actualTransaksiData || !actualTransaksiData.id_pembeli) {
          console.warn("Creating fallback pembeli ID for development purposes");
          // Check if there's a hardcoded test ID we can use, otherwise continue with a placeholder
          const testPembeliId = 1; // Change this to a valid ID that exists in your development DB
          actualTransaksiData = {
            ...actualTransaksiData,
            id_pembeli: testPembeliId
          };
        }

        const transactionId = actualTransaksiData.id_transaksi || jadwalData.id_transaksi;
        console.log("Using transaction ID:", transactionId);
        
        // Step 2.5: Get nota penjualan data if it exists
        let invoiceNumber = "";
        try {
          const notaPenjualan = await getNotaPenjualanByTransaksiId(transactionId);
          if (notaPenjualan) {
            invoiceNumber = notaPenjualan.nomor_nota;
            console.log("Found existing nota with number:", invoiceNumber);
          } else {
            // If no nota found, use a fallback approach to get the invoice number
            console.log("No nota found for transaction. Trying to generate a fallback invoice number.");
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            // Safe toString conversion with padding
            const safeTransactionId = String(transactionId || '000').padStart(3, '0');
            invoiceNumber = `${year}.${month}.${safeTransactionId}`;
            console.log("Generated fallback invoice number:", invoiceNumber);
          }
        } catch (error) {
          console.error("Error fetching nota penjualan:", error);
          // Generate fallback invoice number
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          // Safe toString conversion with padding
          const safeTransactionId = String(transactionId || '000').padStart(3, '0');
          invoiceNumber = `${year}.${month}.${safeTransactionId}`;
          console.log("Generated fallback invoice number after error:", invoiceNumber);
        }

        // Step 3: Get pembeli data to get the id_user
        const pembeliId = actualTransaksiData.id_pembeli;
        console.log("Attempting to fetch pembeli data for ID:", pembeliId);
        
        // Safely fetch pembeli data with user information included
        let pembeliData;
        try {
          // First try with user information included
          console.log("Attempting to fetch pembeli with user data...");
          const pembeliResponse = await useAxios.get(`/pembeli/${pembeliId}?include=user`);
          pembeliData = pembeliResponse.data;
          console.log("Raw pembeli response data:", pembeliResponse.data);
          
          // Check for different response formats to extract pembeli data
          if (pembeliResponse.data && pembeliResponse.data.data) {
            pembeliData = pembeliResponse.data.data;
            console.log("Using nested pembeli data:", pembeliData);
          }
          
          // Debug: Inspect entire pembeli data object
          console.log("Full pembeli data object:", JSON.stringify(pembeliData));
          
          // Check if we already have user data nested in pembeli response
          if (pembeliData && pembeliData.user) {
            console.log("Found user object in pembeli data:", pembeliData.user);
            if (pembeliData.user.email) {
              console.log("Found email in nested user object:", pembeliData.user.email);
              buyerEmail = pembeliData.user.email;
              console.log("Set buyerEmail to:", buyerEmail);
            } else {
              console.log("User object exists but email is undefined or null");
            }
            
            // If the response also contains points directly, use it
            if (pembeliData.jumlah_poin) {
              currentPoints = parseInt(pembeliData.jumlah_poin) || 0;
              console.log("Found points directly in pembeli data:", currentPoints);
            }
          } else if (pembeliData && typeof pembeliData === 'object') {
            // Try to locate user information in other potential locations
            console.log("No direct user object found in pembeli data, searching recursively...");
            
            // Function to search for email recursively in object
            const findEmailInObject = (obj, maxDepth = 3, currentDepth = 0) => {
              if (!obj || typeof obj !== 'object' || currentDepth > maxDepth) return null;
              
              // Direct email property check
              if (obj.email && typeof obj.email === 'string') return obj.email;
              
              // Check user.email pattern
              if (obj.user && obj.user.email) return obj.user.email;
              
              // Recursive search in object properties
              for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                  const result = findEmailInObject(obj[key], maxDepth, currentDepth + 1);
                  if (result) return result;
                }
              }
              
              return null;
            };
            
            const foundEmail = findEmailInObject(pembeliData);
            if (foundEmail) {
              console.log("Found email through recursive search:", foundEmail);
              buyerEmail = foundEmail;
            }
          } else {
            console.log("No user object found in pembeli data");
          }
        } catch (pembeliError) {
          console.error("Error fetching pembeli data:", pembeliError);
          // Create a fallback pembeli object for development
          pembeliData = {
            nama_pembeli: "Pembeli Tidak Ditemukan",
            id_user: null
          };
        }
        
        // If we still don't have the email, try to get it separately
        if (!buyerEmail || buyerEmail === "Email tidak tersedia") {
          console.log("Email still not found, trying alternative methods...");
          
          // Handle different response structures safely with optional chaining
          let buyerUserId = null;
          
          // Try to extract user ID based on different possible response structures
          if (pembeliData && pembeliData.data && pembeliData.data.id_user) {
            buyerUserId = pembeliData.data.id_user;
          } else if (pembeliData && pembeliData.id_user) {
            buyerUserId = pembeliData.id_user;
          } else if (pembeliData && pembeliData.data && pembeliData.data.pembeli && pembeliData.data.pembeli.id_user) {
            buyerUserId = pembeliData.data.pembeli.id_user;
          }
          
          console.log("Buyer's User ID:", buyerUserId);
          
          // Step 4: Get the user email using the pembeli/user endpoint
          if (buyerUserId) {
            try {
              // Use the endpoint that returns both pembeli and nested user data
              const pembeliUserResponse = await useAxios.get(`/pembeli/user/${buyerUserId}`);
              console.log("Pembeli user response:", pembeliUserResponse.data);
              
              // Extract email from the nested user object
              if (pembeliUserResponse.data && 
                  pembeliUserResponse.data.user && 
                  pembeliUserResponse.data.user.email) {
                buyerEmail = pembeliUserResponse.data.user.email;
                console.log("Found buyer email:", buyerEmail);
              } else {
                console.log("No email in pembeli/user response");
                // Try direct access from the response
                if (pembeliUserResponse.data && pembeliUserResponse.data.email) {
                  buyerEmail = pembeliUserResponse.data.email;
                  console.log("Found email directly in response:", buyerEmail);
                }
              }
              
              // Get the customer's current points
              if (pembeliUserResponse.data && 
                  typeof pembeliUserResponse.data.jumlah_poin !== 'undefined') {
                currentPoints = parseInt(pembeliUserResponse.data.jumlah_poin) || 0;
                console.log("Found customer's current points:", currentPoints);
              }
            } catch (error) {
              console.error("Error fetching pembeli/user data:", error);
            }
          }
          
          // If still no email, try a direct user endpoint if ID is available
          if ((!buyerEmail || buyerEmail === "Email tidak tersedia") && buyerUserId) {
            try {
              console.log("Attempting direct user API call with ID:", buyerUserId);
              const userResponse = await useAxios.get(`/user/${buyerUserId}`);
              console.log("User response:", userResponse.data);
              
              if (userResponse.data && userResponse.data.email) {
                buyerEmail = userResponse.data.email;
                console.log("Found email in direct user response:", buyerEmail);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }
        }

        // Step 5: Get courier (pegawai) data
        const pegawaiResponse = await useAxios.get(`/pegawai/${jadwalData.id_pegawai}`);
        const pegawaiData = pegawaiResponse.data;
        
        console.log("Pegawai data fetched:", pegawaiData);
        console.log("Jadwal data id_pegawai:", jadwalData.id_pegawai);
        
        // If pegawaiData is empty or doesn't have nama_pegawai, try to get it from jadwal.pegawai
        if (!pegawaiData || !pegawaiData.nama_pegawai) {
          console.log("Attempting to fetch complete jadwal data with populated pegawai");
          try {
            const fullJadwalResponse = await useAxios.get(`/jadwal/${id_jadwal}?populate=pegawai`);
            const fullJadwalData = fullJadwalResponse.data;
            console.log("Full jadwal data:", fullJadwalData);
            
            if (fullJadwalData.pegawai && fullJadwalData.pegawai.nama_pegawai) {
              console.log("Found pegawai name in jadwal data:", fullJadwalData.pegawai.nama_pegawai);
              pegawaiData.nama_pegawai = fullJadwalData.pegawai.nama_pegawai;
            }
          } catch (err) {
            console.error("Error fetching full jadwal data:", err);
          }
        }

        // Step 6: Get address data
        let alamatData = null;
        try {
          // Get the correct pembeli ID
          const pembeliId = actualTransaksiData.id_pembeli || actualTransaksiData.id_pembeli;
          console.log("Fetching address for pembeli ID:", pembeliId);
          
          if (pembeliId) {
            // Use the imported function instead of direct API call
            const alamatResponse = await getAlamatByPembeliId(pembeliId);
            console.log("Address response:", alamatResponse);
            
            if (alamatResponse && Array.isArray(alamatResponse) && alamatResponse.length > 0) {
              // Try to find the default address first
              alamatData = alamatResponse.find(a => a.is_default) || alamatResponse[0];
              // Ensure alamat_lengkap is not undefined or empty
              if (!alamatData.alamat_lengkap || alamatData.alamat_lengkap.trim() === '') {
                alamatData.alamat_lengkap = "- Alamat tidak tersedia -";
              }
              console.log("Found address:", alamatData);
            } else {
              console.warn("No address found for pembeli ID:", pembeliId);
              // Create fallback address
              alamatData = {
                alamat_lengkap: "- Alamat tidak tersedia -",
                is_default: true
              };
              console.log("Created fallback address:", alamatData);
            }
          } else {
            console.warn("No valid pembeli ID found");
            // Create fallback address
            alamatData = {
              alamat_lengkap: "- Alamat tidak tersedia -",
              is_default: true
            };
            console.log("Created fallback address due to missing pembeli ID:", alamatData);
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          // Create fallback address
          alamatData = {
            alamat_lengkap: "- Alamat tidak tersedia -",
            is_default: true
          };
          console.log("Created fallback address after error:", alamatData);
        }

        // Step 7: Get transaction items
        console.log("Fetching transaction details for ID:", actualTransaksiData.id_transaksi);
        const detailTransaksiResponse = await useAxios.get(`/detailTransaksi/transaksi/${actualTransaksiData.id_transaksi}`);
        console.log("Detail transaksi response:", detailTransaksiResponse);
        
        // Handle different API response formats to ensure we always have an array
        let detailTransaksiData = [];
        
        if (detailTransaksiResponse && detailTransaksiResponse.data) {
          // Check if data is already an array
          if (Array.isArray(detailTransaksiResponse.data)) {
            detailTransaksiData = detailTransaksiResponse.data;
            console.log("Detail transaksi is already an array with", detailTransaksiData.length, "items");
          }
          // Check if data has a nested 'data' property that is an array
          else if (detailTransaksiResponse.data.data && Array.isArray(detailTransaksiResponse.data.data)) {
            detailTransaksiData = detailTransaksiResponse.data.data;
            console.log("Detail transaksi has nested data array with", detailTransaksiData.length, "items");
          }
          // Check if it's a single object (not in an array)
          else if (typeof detailTransaksiResponse.data === 'object' && detailTransaksiResponse.data !== null) {
            detailTransaksiData = [detailTransaksiResponse.data];
            console.log("Detail transaksi is a single object, converted to array");
          }
          else {
            console.error("Unexpected detail transaksi data format:", detailTransaksiResponse.data);
            // Create a fallback empty array
            detailTransaksiData = [];
          }
        }
        
        console.log("Final detail transaksi data (array):", detailTransaksiData);
        
        // If we have no detail items, retry with a more direct approach
        if (detailTransaksiData.length === 0) {
          try {
            console.log("No items found, trying direct detail query");
            // Try another endpoint or approach to get transaction details
            const alternativeDetailResponse = await useAxios.get(`/detailTransaksi?id_transaksi=${actualTransaksiData.id_transaksi}`);
            if (alternativeDetailResponse.data && Array.isArray(alternativeDetailResponse.data)) {
              detailTransaksiData = alternativeDetailResponse.data;
              console.log("Found items through alternative endpoint:", detailTransaksiData.length);
            }
          } catch (detailError) {
            console.error("Alternative detail fetch also failed:", detailError);
          }
        }

        // Step 8: Get complete item details
        console.log("Starting to fetch item details for", detailTransaksiData.length, "items");
        const itemsWithDetails = await Promise.all(detailTransaksiData.map(async (item) => {
          try {
            const barangResponse = await useAxios.get(`/barang/${item.id_barang}`);
            let barang = barangResponse.data;
            
            // Handle nested data structure if present
            if (barangResponse.data && barangResponse.data.data) {
              barang = barangResponse.data.data;
            }
            
            // Make sure we have valid price data
            const harga = item.harga_beli || barang?.harga || 0;
            
            // Fetch penitipan data to get nama_petugas_qc
            let namaPetugasQC = "Tidak tersedia";
            try {
              const penitipanResponse = await useAxios.get(`/penitipanBarang/barang/${item.id_barang}`);
              if (penitipanResponse.data && penitipanResponse.data.nama_petugas_qc) {
                namaPetugasQC = penitipanResponse.data.nama_petugas_qc;
              } else if (penitipanResponse.data && Array.isArray(penitipanResponse.data) && penitipanResponse.data.length > 0) {
                namaPetugasQC = penitipanResponse.data[0].nama_petugas_qc || "Tidak tersedia";
              }
            } catch (penitipanError) {
              console.error(`Error fetching penitipan for barang ${item.id_barang}:`, penitipanError);
            }
            
            // Get actual product name and ensure we have valid data
            const namaBarang = barang?.nama_barang || `Item #${item.id_barang}`;
            const jumlahItem = item.jumlah || 1;
            
            console.log(`Item ${item.id_barang} processed: ${namaBarang}, price: ${harga}, qty: ${jumlahItem}`);
            
            return {
              ...item,
              barang: barang,
              nama_barang: namaBarang,
              harga: parseFloat(harga) || 0,
              jumlah: jumlahItem,
              nama_petugas_qc: namaPetugasQC
            };
          } catch (error) {
            console.error(`Error fetching barang ${item.id_barang} details:`, error);
            // Try an alternative approach to get barang details
            try {
              const alternativeBarangResponse = await useAxios.get(`/barang?id_barang=${item.id_barang}`);
              if (alternativeBarangResponse.data && Array.isArray(alternativeBarangResponse.data) && alternativeBarangResponse.data.length > 0) {
                const altBarang = alternativeBarangResponse.data[0];
                return {
                  ...item,
                  barang: altBarang,
                  nama_barang: altBarang.nama_barang || `Item #${item.id_barang}`,
                  harga: parseFloat(item.harga_beli || altBarang.harga || 0),
                  jumlah: item.jumlah || 1,
                  nama_petugas_qc: "Tidak tersedia"
                };
              }
            } catch (altError) {
              console.error(`Alternative barang fetch also failed for ${item.id_barang}:`, altError);
            }
            
            // Last resort fallback
            return {
              ...item,
              nama_barang: `Item #${item.id_barang}`,
              harga: parseFloat(item.harga_beli || 0),
              jumlah: item.jumlah || 1,
              nama_petugas_qc: "Tidak tersedia"
            };
          }
        }));

        // Fetch QC officer name for display at the top level
        let qcOfficer = "Tidak tersedia";
        if (itemsWithDetails.length > 0 && itemsWithDetails[0].nama_petugas_qc) {
          qcOfficer = itemsWithDetails[0].nama_petugas_qc;
        }

        // Calculate total and points
        const totalAmount = itemsWithDetails.reduce((sum, item) => {
          const itemPrice = parseFloat(item.harga) || 0;
          const itemQty = parseInt(item.jumlah) || 1;
          const itemTotal = itemPrice * itemQty;
          console.log(`Item total calculation: ${itemPrice} × ${itemQty} = ${itemTotal}`);
          return sum + itemTotal;
        }, 0);
        
        console.log("Total amount calculated:", totalAmount);
        const points = calculatePoints(totalAmount);
        const totalPointsAfterTransaction = currentPoints + points;

        // Compile all data
        const finalNotaData = {
          invoiceNumber: invoiceNumber,
          jadwal: jadwalData,
          transaksi: actualTransaksiData,
          pegawai: pegawaiData,
          pembeli: pembeliData,
          buyerEmail: pembeliData.user?.email || buyerEmail,
          alamat: alamatData,
          items: itemsWithDetails,
          qcOfficer: qcOfficer,
          points: points,
          currentPoints: currentPoints,
          totalPointsAfterTransaction: totalPointsAfterTransaction
        };

        console.log("Final compiled nota data:", {
          ...finalNotaData,
          items: `[${finalNotaData.items.length} items]` // Avoid logging all items details
        });
        console.log("Final email being used:", finalNotaData.buyerEmail);
        
        setNotaData(finalNotaData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nota data:', error);
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

  // After notaData is set, log its contents
  useEffect(() => {
    if (notaData) {
      console.log("Rendering with notaData, email:", notaData.buyerEmail);
      console.log("Rendering with notaData, pembeli:", notaData.pembeli);
    }
  }, [notaData]);

  // Format the rendered email for display
  const formatEmailForDisplay = (pembeli, buyerEmail) => {
    // Try the email from various sources
    let email = null;
    
    // 1. Try from pembeli.user?.email
    if (pembeli && pembeli.user && pembeli.user.email) {
      email = pembeli.user.email;
      console.log("Using email from pembeli.user.email:", email);
    } 
    // 2. Try from the buyerEmail variable
    else if (buyerEmail && buyerEmail !== "Email tidak tersedia") {
      email = buyerEmail;
      console.log("Using email from buyerEmail:", email);
    } 
    // 3. Try direct email property if exists
    else if (pembeli && pembeli.email) {
      email = pembeli.email;
      console.log("Using email from pembeli.email:", email);
    }
    // 4. Last fallback
    else {
      email = "Email tidak tersedia";
      console.log("No email found, using fallback");
    }
    
    return email;
  };

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

  const { invoiceNumber, jadwal, transaksi, pegawai, pembeli, buyerEmail, alamat, items, qcOfficer, points, currentPoints, totalPointsAfterTransaction } = notaData;
  const totalAmount = items.reduce((sum, item) => sum + (item.harga * (item.jumlah || 1)), 0);

  // Format the display email
  const displayEmail = formatEmailForDisplay(pembeli, buyerEmail);

  console.log("Rendering receipt with invoice number:", invoiceNumber);
  console.log("Display email:", displayEmail);

  // Format address for display
  const formattedAddress = alamat ? 
    [
      alamat.alamat_lengkap || "- Alamat tidak tersedia -"
    ].filter(part => part && part.trim() !== '').join(', ') : 
    '- Alamat tidak tersedia -';

  // When rendering in the return statement, add logging to debug email access
  if (notaData) {
    console.log("Rendering receipt with:", {
      invoiceNumber: notaData.invoiceNumber,
      buyerEmail: notaData.buyerEmail,
      pembeliEmail: notaData.pembeli?.user?.email,
    });
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Nota Pengiriman Kurir</h2>
        <div>
          {pdfError && (
            <Alert variant="danger" className="mb-2 p-2 small">
              {pdfError}
            </Alert>
          )}
          <Button 
            variant="primary" 
            onClick={() => {
              try {
                // Create a copy of the data with guaranteed valid address
                const dataForPdf = {...notaData, buyerEmail: displayEmail};
                
                // Ensure we have a valid address
                if (!dataForPdf.alamat || !dataForPdf.alamat.alamat_lengkap) {
                  dataForPdf.alamat = {
                    alamat_lengkap: "- Alamat tidak tersedia -",
                    is_default: true
                  };
                }
                
                generatePDF(dataForPdf);
                handleDownloadPDF();
              } catch (error) {
                console.error("Error preparing PDF:", error);
                setPdfError(`Gagal menyiapkan PDF: ${error.message}`);
              }
            }}
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
              <div>: {displayEmail} / {pembeli.nama_pembeli || "Nama tidak tersedia"}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Alamat</div>
              <div className="text-wrap">: {formattedAddress}</div>
            </div>
            <div className="d-flex">
              <div style={{width: '120px'}}>Delivery</div>
              <div>: Kurir ReUseMart ({pegawai?.nama_pegawai || 'Tidak tersedia'})</div>
            </div>
          </div>

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* Items */}
          {items.map((item, index) => {
            const itemTotal = parseFloat(item.harga || 0) * (parseInt(item.jumlah || 1));
            return (
              <div className="d-flex justify-content-between mb-1" key={index}>
                <div>
                  {item.nama_barang} {item.jumlah > 1 ? `(${item.jumlah})` : ''}
                </div>
                <div>{formatCurrency(itemTotal)}</div>
              </div>
            );
          })}

          <hr className="border-1 border-dark border-dotted my-2" />

          {/* Totals */}
          <div className="d-flex justify-content-between mb-1">
            <div>Total</div>
            <div>{formatCurrency(totalAmount)}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Ongkos Kirim</div>
            <div>{formatCurrency(transaksi.biaya_pengiriman || 0)}</div>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <div>Total</div>
            <div>{formatCurrency(totalAmount + (transaksi.biaya_pengiriman || 0))}</div>
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

export default NotaPenjualanKurir;
