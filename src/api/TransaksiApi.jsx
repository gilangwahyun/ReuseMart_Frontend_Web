import useAxios from ".";

const API_URL = "/transaksi";

export const getTransaksiById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
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
