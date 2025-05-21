import useAxios from ".";

const API_URL = "/notaDetailPenitipan";

// Buat data nota detail penitipan baru
export const createNotaDetailPenitipanBarang = async (detailPenitipanData) => {
  try {
    const response = await useAxios.post(API_URL, detailPenitipanData);
    return response.data.data; // mengembalikan data penitipan yang dibuat
  } catch (error) {
    throw error;
  }
};