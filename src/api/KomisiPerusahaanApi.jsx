import useAxios from ".";

// Ambil semua data komisi perusahaan
export const getKomisiPerusahaan = async () => {
  try {
    const response = await useAxios.get("/komisiPerusahaan");
    return response.data;
  } catch (error) {
    console.error("Error fetching komisi perusahaan data:", error);
    throw error;
  }
};

// Ambil data komisi perusahaan berdasarkan ID
export const getKomisiPerusahaanById = async (id) => {
  try {
    const response = await useAxios.get(`/komisiPerusahaan/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi perusahaan with id ${id}:`, error);
    throw error;
  }
};

// Ambil data komisi perusahaan berdasarkan ID transaksi
export const getKomisiPerusahaanByTransaksi = async (id_transaksi) => {
  try {
    const response = await useAxios.get(`/komisiPerusahaan/transaksi/${id_transaksi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi perusahaan for transaksi ${id_transaksi}:`, error);
    throw error;
  }
};

// Ambil data komisi perusahaan berdasarkan ID detail transaksi
export const getKomisiPerusahaanByDetailTransaksi = async (id_detail_transaksi) => {
  try {
    const response = await useAxios.get(`/komisiPerusahaan/detailTransaksi/${id_detail_transaksi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi perusahaan for detail transaksi ${id_detail_transaksi}:`, error);
    throw error;
  }
};

// Tambah data komisi perusahaan baru
export const createKomisiPerusahaan = async (komisiData) => {
  try {
    const response = await useAxios.post("/komisiPerusahaan", komisiData);
    return response.data;
  } catch (error) {
    console.error("Error creating komisi perusahaan:", error);
    throw error;
  }
};

// Batch create untuk komisi perusahaan
export const createBatchKomisiPerusahaan = async (komisiArray) => {
  try {
    if (!komisiArray || komisiArray.length === 0) {
      return { message: "No komisi data provided" };
    }
    
    const response = await useAxios.post("/komisiPerusahaan/batch", {
      komisi: komisiArray
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating batch komisi perusahaan:", error);
    throw error;
  }
};

// Update data komisi perusahaan
export const updateKomisiPerusahaan = async (id, komisiData) => {
  try {
    const response = await useAxios.put(`/komisiPerusahaan/${id}`, komisiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating komisi perusahaan ${id}:`, error);
    throw error;
  }
};

// Hapus data komisi perusahaan
export const deleteKomisiPerusahaan = async (id) => {
  try {
    const response = await useAxios.delete(`/komisiPerusahaan/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting komisi perusahaan ${id}:`, error);
    throw error;
  }
};

// Mendapatkan laporan komisi bulanan
export const getLaporanKomisiBulanan = async (tahun, bulan = null) => {
  try {
    let url = `/komisiPerusahaan/laporan?tahun=${tahun}`;
    if (bulan) {
      url += `&bulan=${bulan}`;
    }
    const response = await useAxios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan komisi bulanan:", error);
    throw error;
  }
};
