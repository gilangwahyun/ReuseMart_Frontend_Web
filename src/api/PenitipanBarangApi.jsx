import useAxios from ".";

const API_URL = "/penitipanBarang";

// Ambil semua data penitipan barang
export const getAllPenitipanBarang = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buat data penitipan baru
export const createPenitipanBarang = async (penitipanData) => {
  try {
    const response = await useAxios.post(API_URL, penitipanData);
    return response.data.data; // mengembalikan data penitipan yang dibuat
  } catch (error) {
    throw error;
  }
};

// Ambil data penitipan berdasarkan ID
export const getPenitipanBarangById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update data penitipan berdasarkan ID
export const updatePenitipanBarang = async (id, updatedData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, updatedData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Hapus data penitipan berdasarkan ID
export const deletePenitipanBarang = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};