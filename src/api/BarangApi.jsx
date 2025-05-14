import useAxios from ".";

const API_URL = "/barang";

export const getAllActiveBarang = async () => {
  try {
    const response = await useAxios.get(`${API_URL}/cari-status?status=Aktif`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllDonateBarang = async () => {
  try {
    const response = await useAxios.get(`${API_URL}/cari-status?status=Barang untuk Donasi`);
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
    const response = await useAxios.get(`${API_URL}/cari-kategori?kategori=${encodeURIComponent(namaKategori)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchBarangByName = async (nama_barang) => {
  try {
    console.log("Mencari barang dengan kata kunci:", nama_barang);
    const response = await useAxios.get(`${API_URL}/cari`, {
      params: { nama_barang },
    });
    return response.data;
  } catch (error) {
    console.error("Terjadi kesalahan saat mencari barang:", error);
    throw error;
  }
};