import useAxios from ".";

const API_URL = "/transaksi";

export const createTransaksi = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDetailTransaksi = async (data) => {
  try {
    const response = await useAxios.post("/detailTransaksi", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransaksiById = async (id_transaksi) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id_transaksi}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransaksiByPembeli = async (id_pembeli) => {
  try {
    const response = await useAxios.get(`${API_URL}/pembeli/${id_pembeli}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransaksiByPenitip = async (id_penitip) => {
  try {
    const response = await useAxios.get(`${API_URL}/penitip/${id_penitip}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transactions for penitip ID ${id_penitip}:`, error);
    return [];
  }
};

export const getAllTransaksi = async () => {
  try {
    const response = await useAxios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusTransaksi = async (id_transaksi, status) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id_transaksi}/status`, { status_transaksi: status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLaporanPenjualanBulanan = async (tahun = new Date().getFullYear()) => {
  try {
    const response = await useAxios.get(`${API_URL}/laporan/penjualan-bulanan`, {
      params: { tahun }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching laporan penjualan bulanan:", error);
    throw error;
  }
};

export const getLaporanKomisi = async (tahun = new Date().getFullYear(), bulan = null) => {
  try {
    const response = await useAxios.get(`${API_URL}/laporan/komisi`, {
      params: { tahun, bulan }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Gagal mengambil data laporan komisi');
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching laporan komisi:", error);
    throw error;
  }
};