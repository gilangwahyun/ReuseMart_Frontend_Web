import useAxios from ".";

export const createKomisiPerusahaan = async (dataKomisi) => {
  try {
    const response = await useAxios.post('/komisiPerusahaan', dataKomisi);
    return response.data;
  } catch (error) {
    console.error("Error creating KomisiPerusahaan:", error);
    throw error;
  }
};

export const createBatchKomisiPerusahaan = async (batchKomisi) => {
  try {
    const response = await useAxios.post('/komisiPerusahaan/batch', { komisi: batchKomisi });
    return response.data;
  } catch (error) {
    console.error("Error creating batch KomisiPerusahaan:", error);
    throw error;
  }
};

export const getKomisiPerusahaanByTransaksi = async (idTransaksi) => {
  try {
    const response = await useAxios.get(`/komisiPerusahaan/transaksi/${idTransaksi}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching KomisiPerusahaan by transaksi:", error);
    throw error;
  }
};
