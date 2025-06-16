import useAxios from ".";

const API_URL = "/diskusi";

export const getAllDiskusi = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDiskusiById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDiskusi = async (diskusiData) => {
  try {
    // Pastikan token sudah disertakan di axios interceptor
    const response = await useAxios.post(API_URL, diskusiData);
    return response.data.data || response.data; // Mengambil data dari respons
  } catch (error) {
    throw error;
  }
};

export const deleteDiskusi = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDiskusiByBarang = async (id_barang) => {
  try {
    const response = await useAxios.get(`${API_URL}/barang/${id_barang}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add new function to check if user can delete diskusi
export const canDeleteDiskusi = async (id_diskusi) => {
  try {
    const response = await useAxios.get(`${API_URL}/check-owner/${id_diskusi}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper untuk mendapatkan data user dari localStorage
export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};