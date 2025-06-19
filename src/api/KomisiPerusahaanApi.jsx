import useAxios from ".";

const API_URL = "/komisiPerusahaan";

// Mendapatkan semua data komisi perusahaan
export const getAllKomisiPerusahaan = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching komisi perusahaan:", error);
    throw error;
  }
};

// Mendapatkan data komisi perusahaan berdasarkan ID
export const getKomisiPerusahaanById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching komisi perusahaan dengan ID ${id}:`, error);
    throw error;
  }
};

// Menambahkan komisi perusahaan baru
export const createKomisiPerusahaan = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating komisi perusahaan:", error);
    throw error;
  }
};

// Memperbarui komisi perusahaan berdasarkan ID
export const updateKomisiPerusahaan = async (id, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating komisi perusahaan dengan ID ${id}:`, error);
    throw error;
  }
};

export const createBatchKomisiPerusahaan = async (batchKomisi) => {
  try {
    const response = await useAxios.post('/komisiPerusahaan/batch', { komisi: batchKomisi });
    return response.data;
  } catch (error) {
    console.error("Error creating batch KomisiPerusahaan:", error);
  }
};

// Menghapus komisi perusahaan berdasarkan ID
export const deleteKomisiPerusahaan = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting komisi perusahaan dengan ID ${id}:`, error);
    throw error;
  }
};

export const getKomisiPerusahaanByTransaksi = async (idTransaksi) => {
  try {
    const response = await useAxios.get(`/komisiPerusahaan/transaksi/${idTransaksi}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching KomisiPerusahaan by transaksi:", error);
  }
};

// Mendapatkan laporan komisi bulanan
export const getLaporanKomisiBulanan = async (tahun, bulan = null) => {
  try {
    let url = `${API_URL}/laporan`;
    const params = new URLSearchParams();
    params.append('tahun', tahun);
    if (bulan) {
      params.append('bulan', bulan);
    }
    
    const response = await useAxios.get(`${url}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching laporan komisi bulanan:`, error);
    throw error;
  }
};
