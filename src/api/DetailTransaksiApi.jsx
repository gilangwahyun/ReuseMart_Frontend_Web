import useAxios from ".";

export const getDetailTransaksiByTransaksi = async (id_transaksi) => {
  try {
    console.log(`API call: Getting details for transaction ID: ${id_transaksi}`);
    
    // Use the direct endpoint that should now work correctly
    const response = await useAxios.get(`/detailTransaksi/transaksi/${id_transaksi}`);
    
    console.log("Response from API:", response.data);
    
    // Handle different response structures
    if (response.data && response.data.success !== undefined) {
      // API is returning { success: true, message: "...", data: [...] } format
      console.log("Using data field from success/data structure");
      return response.data.data || [];
    } else if (Array.isArray(response.data)) {
      // API is directly returning array
      return response.data;
    } else {
      console.warn("Unexpected response format from API:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return []; // Return empty array on error
  }
};

export const getPenitipanDetailsByTransaksi = async (id_transaksi) => {
  try {
    console.log(`API call: Getting penitipan details for transaction ID: ${id_transaksi}`);
    
    const response = await useAxios.get(`/detailTransaksi/transaksi/${id_transaksi}/penitipan-details`);
    
    console.log("Response from API (penitipan details):", response.data);
    
    // Handle different response structures
    if (response.data && response.data.success !== undefined) {
      return response.data.data || [];
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected response format from API (penitipan details):", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching penitipan details for transaction:", error);
    return []; // Return empty array on error
  }
};

export const getPenitipanPegawaiByTransaksi = async (id_transaksi) => {
  try {
    console.log(`API call: Getting penitipan and pegawai details for transaction ID: ${id_transaksi}`);
    
    // Using the direct join query for better performance
    const response = await useAxios.get(`/transaksi/${id_transaksi}/penitipan-pegawai-join`);
    
    console.log("Response from API (penitipan-pegawai details):", response.data);
    
    // Handle different response structures
    if (response.data && response.data.success !== undefined) {
      return response.data.data || [];
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected response format from API (penitipan-pegawai details):", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching penitipan-pegawai details for transaction:", error);
    return []; // Return empty array on error
  }
};

export const getPenitipanPenitipByTransaksi = async (id_transaksi) => {
  try {
    console.log(`API call: Getting penitipan and penitip details for transaction ID: ${id_transaksi}`);
    
    // First, get the transaction details which should contain id_penitipan
    const detailsResponse = await getDetailTransaksiByTransaksi(id_transaksi);
    
    if (!detailsResponse || !Array.isArray(detailsResponse) || detailsResponse.length === 0) {
      console.warn(`No details found for transaction ${id_transaksi}`);
      return [];
    }
    
    // Process details to add penitip information
    const detailsWithPenitip = [];
    
    for (const detail of detailsResponse) {
      try {
        // Log complete detail object for debugging
        console.log(`Processing detail for transaction ${id_transaksi}:`, detail);
        
        // Extract nama_barang from wherever it exists
        let namaBarang = detail.nama_barang;
        if (!namaBarang && detail.barang && detail.barang.nama_barang) {
          namaBarang = detail.barang.nama_barang;
        }
        
        // Extract penitip info from nested objects if available
        let idPenitip = null;
        let namaPenitip = 'Tidak diketahui';
        let tanggalAwalPenitipan = '-';
        
        // Check for nested penitip info in penitipan_barang
        if (detail.barang && detail.barang.penitipan_barang) {
          // Extract tanggal from penitipan_barang
          if (detail.barang.penitipan_barang.tanggal_awal_penitipan) {
            tanggalAwalPenitipan = detail.barang.penitipan_barang.tanggal_awal_penitipan;
          }
          
          // Extract penitip info
          if (detail.barang.penitipan_barang.penitip) {
            idPenitip = detail.barang.penitipan_barang.penitip.id_penitip;
            namaPenitip = detail.barang.penitipan_barang.penitip.nama_penitip;
            
            // Add complete detail with extracted info
            detailsWithPenitip.push({
              ...detail,
              nama_barang: namaBarang || 'Barang Tidak Bernama',
              id_penitip: idPenitip,
              nama_penitip: namaPenitip,
              tanggal_awal_penitipan: tanggalAwalPenitipan
            });
            continue;
          }
        }
        
        // If no penitip found in nested structure, try fetching from API if we have id_penitipan
        if (detail.id_penitipan) {
          const penitipanResponse = await useAxios.get(`/penitipanBarang/${detail.id_penitipan}`);
          
          if (penitipanResponse.data) {
            // Get tanggal_awal_penitipan
            if (penitipanResponse.data.tanggal_awal_penitipan) {
              tanggalAwalPenitipan = penitipanResponse.data.tanggal_awal_penitipan;
            }
            
            // If penitipan has id_penitip, try to get penitip data
            if (penitipanResponse.data.id_penitip) {
              try {
                const penitipResponse = await useAxios.get(`/penitip/${penitipanResponse.data.id_penitip}`);
                
                if (penitipResponse.data) {
                  idPenitip = penitipResponse.data.id_penitip;
                  namaPenitip = penitipResponse.data.nama_penitip;
                }
              } catch (penitipErr) {
                console.error(`Error fetching penitip data for id ${penitipanResponse.data.id_penitip}:`, penitipErr);
              }
            }
          }
        }
        
        // Add detail with whatever info we have
        detailsWithPenitip.push({
          ...detail,
          nama_barang: namaBarang || 'Barang Tidak Bernama',
          id_penitip: idPenitip,
          nama_penitip: namaPenitip,
          tanggal_awal_penitipan: tanggalAwalPenitipan
        });
        
      } catch (detailError) {
        console.error(`Error processing detail:`, detailError);
        detailsWithPenitip.push({
          ...detail,
          nama_barang: detail.nama_barang || 'Barang Tidak Bernama',
          nama_penitip: 'Error: Tidak dapat memuat data',
          tanggal_awal_penitipan: '-'
        });
      }
    }
    
    return detailsWithPenitip;
  } catch (error) {
    console.error("Error fetching penitipan-penitip details for transaction:", error);
    return []; // Return empty array on error
  }
};
