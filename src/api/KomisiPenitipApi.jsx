import useAxios from ".";

const API_URL = "/komisiPenitip";

// Mendapatkan semua data komisi penitip
export const getAllKomisiPenitip = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching komisi penitip:", error);
    throw error;
  }
};

// Mendapatkan data komisi penitip berdasarkan ID
export const getKomisiPenitipById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching komisi penitip dengan ID ${id}:`, error);
    throw error;
  }
};

// Menambahkan komisi penitip baru
export const createKomisiPenitip = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating komisi penitip:", error);
    throw error;
  }
};

// Memperbarui komisi penitip berdasarkan ID
export const updateKomisiPenitip = async (id, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating komisi penitip dengan ID ${id}:`, error);
    throw error;
  }
};

// Menghapus komisi penitip berdasarkan ID
export const deleteKomisiPenitip = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting komisi penitip dengan ID ${id}:`, error);
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
