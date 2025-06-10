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

export const getTransaksiByPembeli = async (id_pembeli) => {
  try {
    const response = await useAxios.get(`${API_URL}/pembeli/${id_pembeli}`);
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
