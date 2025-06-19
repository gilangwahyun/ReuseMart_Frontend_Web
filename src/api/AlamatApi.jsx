import useAxios from ".";

const API_URL = "/alamat";

/**
 * Membuat alamat baru
 * @param {Object} data - Data alamat yang akan dibuat
 * @param {number} data.id_pembeli - ID pembeli
 * @param {string} data.label_alamat - Label alamat (contoh: "Rumah", "Kantor")
 * @param {string} data.alamat_lengkap - Alamat lengkap
 * @param {string} data.nama_penerima - Nama penerima
 * @param {string} data.no_hp - Nomor HP penerima
 * @param {boolean} data.is_default - Status alamat default
 * @returns {Promise<Object>} Response dari server
 */
export const createAlamat = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating alamat:", error);
    throw error;
  }
};

/**
 * Mendapatkan semua alamat
 * @returns {Promise<Array>} Daftar alamat
 */
export const getAlamat = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching alamat:", error);
    throw error;
  }
};

/**
 * Memperbarui alamat berdasarkan ID
 * @param {number} id - ID alamat yang akan diperbarui
 * @param {Object} alamatData - Data alamat yang akan diperbarui
 * @returns {Promise<Object>} Response dari server
 */
export const updateAlamat = async (id, alamatData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, alamatData);
    return response.data;
  } catch (error) {
    console.error(`Error updating alamat with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Mendapatkan alamat berdasarkan ID
 * @param {number} id - ID alamat yang akan diambil
 * @returns {Promise<Object>} Data alamat
 */
export const getAlamatById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching alamat with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Mendapatkan alamat berdasarkan ID pembeli
 * @param {number} id_pembeli - ID pembeli
 * @returns {Promise<Array>} Daftar alamat pembeli
 */
export const getAlamatByPembeliId = async (id_pembeli) => {
  try {
    const response = await useAxios.get(`${API_URL}/pembeli/${id_pembeli}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching alamat for pembeli ${id_pembeli}:`, error);
    throw error;
  }
};

/**
 * Menghapus alamat berdasarkan ID
 * @param {number} id - ID alamat yang akan dihapus
 * @returns {Promise<Object>} Response dari server
 */
export const deleteAlamat = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting alamat with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Mengatur alamat sebagai default dan membuat alamat lain non-default
 * @param {number} id - ID alamat yang akan diatur sebagai default
 * @param {number} id_pembeli - ID pembeli untuk mengambil semua alamat
 * @returns {Promise<Object>} Response dari server
 */
export const setDefaultAlamat = async (id, id_pembeli) => {
  try {
    // 1. Ambil semua alamat milik pembeli ini
    const alamatList = await getAlamatByPembeliId(id_pembeli);
    
    // 2. Untuk setiap alamat, update is_default sesuai kebutuhan
    const updatePromises = alamatList.map(alamat => {
      const isSelected = alamat.id_alamat === id;
      
      // Jika status is_default sudah sesuai, tidak perlu update
      if (alamat.is_default === isSelected) return Promise.resolve();
      
      // Jika perlu update, kirim request
      return updateAlamat(alamat.id_alamat, {
        ...alamat,
        is_default: isSelected
      });
    });
    
    // 3. Tunggu semua proses update selesai
    await Promise.all(updatePromises);
    
    // 4. Return data alamat yang diset default
    return { success: true, message: "Default alamat berhasil diubah" };
  } catch (error) {
    console.error(`Error setting default alamat with ID ${id}:`, error);
    throw error;
  }
};