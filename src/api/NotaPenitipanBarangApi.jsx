import useAxios from ".";

const API_URL = "/notaPenitipanBarang";

// Ambil semua data nota penitipan barang
export const getAllNotaPenitipanBarang = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buat data nota detail penitipan baru
export const createNotaPenitipanBarang = async (notaPenitipanData) => {
  try {
    const response = await useAxios.post(API_URL, notaPenitipanData);
    return response.data; // mengembalikan data penitipan yang dibuat
  } catch (error) {
    throw error;
  }
};

export const getNotaPenitipanBarangById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan nota berdasarkan id_penitipan
export const getNotaByPenitipanId = async (id_penitipan) => {
  try {
    const response = await useAxios.get(`${API_URL}?id_penitipan=${id_penitipan}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const printNotaPenitipanBarang = async (notaId) => {
  try {
    const response = await useAxios.get(`${API_URL}/${notaId}/cetak`, {
      responseType: 'blob',
    });
    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  } catch (error) {
    throw error;
  }
};

// Mencetak nota berdasarkan id_penitipan
export const printNotaByPenitipanId = async (id_penitipan) => {
  try {
    const response = await useAxios.get(`${API_URL}/cetak/${id_penitipan}`, {
      responseType: 'blob',
    });
    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
    return fileURL;
  } catch (error) {
    throw error;
  }
};

export const deleteNotaPenitipanBarang = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};