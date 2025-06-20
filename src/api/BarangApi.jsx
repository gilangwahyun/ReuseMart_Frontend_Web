// import useAxios from ".";

// const API_URL = "/barang";

// export const getAllBarang = async () => {
//   try {
//     const response = await useAxios.get(API_URL);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


// export const getAllActiveBarang = async () => {
//   try {
//     const response = await useAxios.get(`${API_URL}/cari-status?status=Aktif`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getAllDonateBarang = async () => {
//   try {
//     const response = await useAxios.get(`${API_URL}/cari-status?status=Barang untuk Donasi`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getBarangById = async (id) => {
//   try {
//     const response = await useAxios.get(`${API_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const createBarang = async (barangData) => {
//   try {
//     const response = await useAxios.post(API_URL, barangData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const updateBarang = async (id, barangData) => {
//   try {
//     const response = await useAxios.put(`${API_URL}/${id}`, barangData);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const deleteBarang = async (id) => {
//   try {
//     const response = await useAxios.delete(`${API_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getBarangByKategori = async (namaKategori) => {
//   try {
//     const response = await useAxios.get(`${API_URL}/cari-kategori?kategori=${encodeURIComponent(namaKategori)}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const searchBarangByName = async (nama_barang) => {
//   try {
//     console.log("Mencari barang dengan kata kunci:", nama_barang);
//     const response = await useAxios.get(`${API_URL}/cari`, {
//       params: { nama_barang },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Terjadi kesalahan saat mencari barang:", error);
//     throw error;
//   }
// };

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
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Barang tidak ditemukan');
  } catch (error) {
    console.error('Error fetching barang details:', error);
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
    if (!nama_barang || nama_barang.trim() === "") {
      return await getAllActiveBarang();
    }

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

export const updateBarangStatus = async (id, status) => {
  try {
    console.log(`Updating barang ${id} status to: "${status}"`);
    const response = await useAxios.put(`${API_URL}/${id}/status`, {
      status_barang: status,
    });
    console.log("Status update response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating barang ${id} status:`, error);
    throw error;
  }
};

export const getSalesReportByCategory = async () => {
  try {
    const response = await useAxios.get(`${API_URL}/reports/sales-by-category`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales report by category:", error);
    throw error;
  }
};

export const getLaporanStokGudang = async () => {
  try {
    const response = await useAxios.get(`${API_URL}/laporan/stok-gudang`);
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan stok gudang:", error);
    throw error;
  }
};
