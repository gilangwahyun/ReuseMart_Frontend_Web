import useAxios from ".";

const API_URL = "/pembayaran";

export const createPembayaran = async (formData) => {
  try {
    const response = await useAxios.post('/pembayaran', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusVerifikasi = async (id_pembayaran, status) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id_pembayaran}/status-verifikasi`, {
      status_verifikasi: status
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllPembayaranCS = async () => {
  try {
    const response = await useAxios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPembayaranById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPembayaranByTransaksiId = async (id_transaksi) => {
  try {
    const response = await useAxios.get(`${API_URL}/transaksi/${id_transaksi}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPembayaran = async (keyword) => {
  try {
    const response = await useAxios.get(`${API_URL}/search?keyword=${keyword}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const filterPembayaran = async (params) => {
  try {
    // Buat query string dari parameter
    const queryParams = new URLSearchParams();
    
    if (params.status_verifikasi) queryParams.append('status_verifikasi', params.status_verifikasi);
    if (params.tanggal_awal) queryParams.append('tanggal_awal', params.tanggal_awal);
    if (params.tanggal_akhir) queryParams.append('tanggal_akhir', params.tanggal_akhir);
    if (params.metode_pembayaran) queryParams.append('metode_pembayaran', params.metode_pembayaran);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    
    const queryString = queryParams.toString();
    const response = await useAxios.get(`${API_URL}/filter?${queryString}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};