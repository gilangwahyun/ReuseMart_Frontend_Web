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
