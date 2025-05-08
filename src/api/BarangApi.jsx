import useAxios from ".";

const API_URL = "/barang";

export const getAllBarang = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBarangById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBarang = async (barangData) => {
  try {
    const response = await useAxios.post(API_URL, barangData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBarang = async (id, barangData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, barangData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBarang = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBarangByKategori = async (namaKategori) => {
  try {
    const response = await useAxios.get(`${API_URL}?kategori=${encodeURIComponent(namaKategori)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};