import useAxios from ".";

export const createKomisiPenitip = async (dataKomisi) => {
  try {
    const response = await useAxios.post('/komisiPenitip', dataKomisi);
    return response.data;
  } catch (error) {
    console.error("Error creating KomisiPenitip:", error);
    throw error;
  }
};

export const createBatchKomisiPenitip = async (batchKomisi) => {
  try {
    const response = await useAxios.post('/komisiPenitip/batch', { komisi: batchKomisi });
    return response.data;
  } catch (error) {
    console.error("Error creating batch KomisiPenitip:", error);
    throw error;
  }
};

export const getKomisiPenitipByTransaksi = async (idTransaksi) => {
  try {
    const response = await useAxios.get(`/komisiPenitip/transaksi/${idTransaksi}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching KomisiPenitip by transaksi:", error);
    throw error;
  }
};
