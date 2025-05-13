import useAxios from ".";

export const getDetailTransaksiByTransaksi = async (id_transaksi) => {
  try {
    const response = await useAxios.get(`/detailTransaksi?filter_by_transaksi=${id_transaksi}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
