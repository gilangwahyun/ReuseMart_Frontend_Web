import useAxios from ".";

const API_URL = "/penitip";

export const registerPenitip = async (data) => {
  try {
    const response = await useAxios.post("/penitip", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tampilkan semua penitip
export const getAllPenitip = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tampilkan penitip berdasarkan ID
export const getPenitipById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update penitip
export const updatePenitip = async (id, data) => {
  try {
    const response = await useAxios.put(`/penitip/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error saat update penitip ID ${id}:`, error);
    throw error;
  }
};

// Hapus penitip
export const deletePenitip = async (id) => {
  try {
    const response = await useAxios.delete(`/penitip/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error saat hapus penitip ID ${id}:`, error);
    throw error;
  }
};

export const searchPenitipByName = async (nama_penitip) => {
  try {
    const response = await useAxios.get(`/penitip?nama_penitip=${encodeURIComponent(nama_penitip)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
