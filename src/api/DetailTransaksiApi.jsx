import useAxios from ".";

export const getDetailTransaksiByTransaksi = async (id_transaksi) => {
  try {
    console.log(`API call: Getting details for transaction ID: ${id_transaksi}`);
    
    // Use the direct endpoint that should now work correctly
    const response = await useAxios.get(`/detailTransaksi/transaksi/${id_transaksi}`);
    
    console.log("Response from API:", response.data);
    return response.data;
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Error fetching penitipan-pegawai details for transaction:", error);
    return []; // Return empty array on error
  }
};

export const getPenitipanPenitipByTransaksi = async (id_transaksi) => {
  try {
    console.log(`API call: Getting penitipan and penitip details for transaction ID: ${id_transaksi}`);
    
    // Using the direct join query to get penitip information
    const response = await useAxios.get(`/transaksi/${id_transaksi}/penitipan-penitip`);
    
    console.log("Response from API (penitipan-penitip details):", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching penitipan-penitip details for transaction:", error);
    return []; // Return empty array on error
  }
};
