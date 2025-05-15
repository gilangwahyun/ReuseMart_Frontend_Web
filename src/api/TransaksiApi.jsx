import useAxios from ".";

export const getTransaksiByPembeli = async (id_pembeli) => {
  try {
    const response = await useAxios.get(`/transaksi/pembeli/${id_pembeli}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
