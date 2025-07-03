import useAxios from ".";

const API_URL = "/komisiPenitip";

// Ambil semua data komisi penitip
export const getKomisiPenitip = async () => {
  try {
    const response = await useAxios.get("/komisiPenitip");
    return response.data;
  } catch (error) {
    console.error("Error fetching komisi penitip data:", error);
    throw error;
  }
};

// Ambil data komisi penitip berdasarkan ID
export const getKomisiPenitipById = async (id) => {
  try {
    const response = await useAxios.get(`/komisiPenitip/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi penitip with id ${id}:`, error);
    throw error;
  }
};

// Ambil data komisi penitip berdasarkan ID transaksi
export const getKomisiPenitipByTransaksi = async (id_transaksi) => {
  try {
    const response = await useAxios.get(`/komisiPenitip/transaksi/${id_transaksi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi penitip for transaksi ${id_transaksi}:`, error);
    throw error;
  }
};

// Ambil data komisi penitip berdasarkan ID detail transaksi
export const getKomisiPenitipByDetailTransaksi = async (id_detail_transaksi) => {
  try {
    const response = await useAxios.get(`/komisiPenitip/detailTransaksi/${id_detail_transaksi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi penitip for detail transaksi ${id_detail_transaksi}:`, error);
    throw error;
  }
};

// Tambah data komisi penitip baru
export const createKomisiPenitip = async (komisiData) => {
  try {
    const response = await useAxios.post("/komisiPenitip", komisiData);
    return response.data;
  } catch (error) {
    console.error("Error creating komisi penitip:", error);
    throw error;
  }
};

// Batch create untuk komisi penitip
export const createBatchKomisiPenitip = async (komisiArray) => {
  try {
    if (!komisiArray || komisiArray.length === 0) {
      return { message: "No komisi data provided" };
    }
    
    const response = await useAxios.post("/komisiPenitip/batch", {
      komisi: komisiArray
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating batch komisi penitip:", error);
    throw error;
  }
};

// Update data komisi penitip
export const updateKomisiPenitip = async (id, komisiData) => {
  try {
    const response = await useAxios.put(`/komisiPenitip/${id}`, komisiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating komisi penitip ${id}:`, error);
    throw error;
  }
};

// Hapus data komisi penitip
export const deleteKomisiPenitip = async (id) => {
  try {
    const response = await useAxios.delete(`/komisiPenitip/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting komisi penitip ${id}:`, error);
    throw error;
  }
};

// Mendapatkan laporan komisi penitip bulanan
export const getLaporanKomisiPenitipBulanan = async (tahun, bulan = null, idPenitip = null) => {
  try {
    let url = `${API_URL}/laporan`;
    const params = new URLSearchParams();
    params.append('tahun', tahun);
    
    if (bulan) {
      params.append('bulan', bulan);
    }
    if (idPenitip) {
      params.append('id_penitip', idPenitip);
    }
    
    const response = await useAxios.get(`${url}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching laporan komisi penitip bulanan:`, error);
    throw error;
  }
};
