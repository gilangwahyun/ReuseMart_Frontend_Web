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

export const updateBarangRating = async (id, barangData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}/rating`, barangData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchBarangAllField = async (keyword, tanggalAwal, tanggalAkhir) => {
  try {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (tanggalAwal) params.tanggal_awal = tanggalAwal;
    if (tanggalAkhir) params.tanggal_akhir = tanggalAkhir;
    const response = await useAxios.get(`${API_URL}/advanced/all-search`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
