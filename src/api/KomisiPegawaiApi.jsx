import useAxios from ".";

export const createKomisiPegawai = async (dataKomisi) => {
  try {
    const response = await useAxios.post('/komisiPegawai', dataKomisi);
    return response.data;
  } catch (error) {
    console.error("Error creating KomisiPegawai:", error);
    throw error;
  }
};

export const createBatchKomisiPegawai = async (batchKomisi) => {
  try {
    const response = await useAxios.post('/komisiPegawai/batch', { komisi: batchKomisi });
    return response.data;
  } catch (error) {
    console.error("Error creating batch KomisiPegawai:", error);
    throw error;
  }
};

export const getKomisiPegawaiByTransaksi = async (idTransaksi) => {
  try {
    const response = await useAxios.get(`/komisiPegawai/transaksi/${idTransaksi}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching KomisiPegawai by transaksi:", error);
    throw error;
  }
};
