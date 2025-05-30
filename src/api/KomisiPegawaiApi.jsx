import useAxios from ".";

const API_URL = "/komisiPegawai";

// Mendapatkan semua data komisi pegawai
export const getAllKomisiPegawai = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching komisi pegawai:", error);
    throw error;
  }
};

// Mendapatkan data komisi pegawai berdasarkan ID
export const getKomisiPegawaiById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching komisi pegawai dengan ID ${id}:`, error);
    throw error;
  }
};

// Menambahkan komisi pegawai baru
export const createKomisiPegawai = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating komisi pegawai:", error);
    throw error;
  }
};

// Memperbarui komisi pegawai berdasarkan ID
export const updateKomisiPegawai = async (id, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating komisi pegawai dengan ID ${id}:`, error);
    throw error;
  }
};

// Menghapus komisi pegawai berdasarkan ID
export const deleteKomisiPegawai = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting komisi pegawai dengan ID ${id}:`, error);
    throw error;
  }
};

// Mendapatkan laporan komisi hunter bulanan
export const getLaporanKomisiHunterBulanan = async (tahun, bulan = null, idPegawai = null) => {
  try {
    let url = `${API_URL}/laporan`;
    const params = new URLSearchParams();
    params.append('tahun', tahun);
    
    if (bulan) {
      params.append('bulan', bulan);
    }
    if (idPegawai) {
      params.append('id_pegawai', idPegawai);
    }
    
    const response = await useAxios.get(`${url}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching laporan komisi hunter bulanan:`, error);
    throw error;
  }
};
