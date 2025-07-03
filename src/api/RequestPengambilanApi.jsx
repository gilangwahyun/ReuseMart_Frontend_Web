import useAxios from ".";

const API_URL = "/request-pengambilan";

/**
 * Mengambil semua request pengambilan barang untuk penitip tertentu
 * @param {number} idPenitip - ID penitip
 * @returns {Promise} - Promise yang mengembalikan data request pengambilan
 */
export const getRequestPengambilanByPenitip = async (idPenitip) => {
  try {
    const response = await useAxios.get(`${API_URL}/penitip/${idPenitip}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching request pengambilan data:', error);
    throw error;
  }
};

/**
 * Membuat request pengambilan baru
 * @param {Object} requestData - Data request pengambilan
 * @param {number} requestData.id_penitip - ID penitip
 * @param {number} requestData.id_barang - ID barang
 * @param {string} requestData.tanggal_pengambilan - Tanggal pengambilan dalam format YYYY-MM-DD
 * @returns {Promise} - Promise yang mengembalikan data request pengambilan yang baru dibuat
 */
export const createRequestPengambilan = async (requestData) => {
  try {
    const response = await useAxios.post(API_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating request pengambilan:', error);
    throw error;
  }
};

/**
 * Mengambil detail request pengambilan berdasarkan ID
 * @param {number} idRequest - ID request pengambilan
 * @returns {Promise} - Promise yang mengembalikan data detail request pengambilan
 */
export const getRequestPengambilanById = async (idRequest) => {
  try {
    const response = await useAxios.get(`${API_URL}/${idRequest}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching request pengambilan detail:', error);
    throw error;
  }
};

/**
 * Membatalkan request pengambilan
 * @param {number} idRequest - ID request pengambilan
 * @returns {Promise} - Promise yang mengembalikan status pembatalan
 */
export const cancelRequestPengambilan = async (idRequest) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${idRequest}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling request pengambilan:', error);
    throw error;
  }
};

/**
 * Memperbarui tanggal pengambilan pada request pengambilan
 * @param {number} idRequest - ID request pengambilan
 * @param {Object} updateData - Data yang akan diperbarui
 * @param {string} updateData.tanggal_pengambilan - Tanggal pengambilan baru dalam format YYYY-MM-DD
 * @returns {Promise} - Promise yang mengembalikan data request pengambilan yang telah diperbarui
 */
export const updateRequestPengambilan = async (idRequest, updateData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${idRequest}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating request pengambilan:', error);
    throw error;
  }
}; 