import useAxios from ".";

const API_URL = "/komisiPegawai";

// Ambil semua data komisi pegawai
export const getKomisiPegawai = async () => {
  try {
    const response = await useAxios.get("/komisiPegawai");
    return response.data;
  } catch (error) {
    console.error("Error fetching komisi pegawai data:", error);
    throw error;
  }
};

// Ambil data komisi pegawai berdasarkan ID
export const getKomisiPegawaiById = async (id) => {
  try {
    const response = await useAxios.get(`/komisiPegawai/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi pegawai with id ${id}:`, error);
    throw error;
  }
};

// Ambil data komisi pegawai berdasarkan ID transaksi
export const getKomisiPegawaiByTransaksi = async (id_transaksi) => {
  try {
    const response = await useAxios.get(`/komisiPegawai/transaksi/${id_transaksi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi pegawai for transaksi ${id_transaksi}:`, error);
    throw error;
  }
};

// Ambil data komisi pegawai berdasarkan ID detail transaksi
export const getKomisiPegawaiByDetailTransaksi = async (id_detail_transaksi) => {
  try {
    const response = await useAxios.get(`/komisiPegawai/detailTransaksi/${id_detail_transaksi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching komisi pegawai for detail transaksi ${id_detail_transaksi}:`, error);
    throw error;
  }
};

// Tambah data komisi pegawai baru
export const createKomisiPegawai = async (komisiData) => {
  try {
    const response = await useAxios.post("/komisiPegawai", komisiData);
    return response.data;
  } catch (error) {
    console.error("Error creating komisi pegawai:", error);
    throw error;
  }
};

// Batch create untuk komisi pegawai
export const createBatchKomisiPegawai = async (komisiArray) => {
  try {
    if (!komisiArray || komisiArray.length === 0) {
      return { message: "No komisi data provided" };
    }
    
    const response = await useAxios.post("/komisiPegawai/batch", {
      komisi: komisiArray
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating batch komisi pegawai:", error);
    throw error;
  }
};

// Update data komisi pegawai
export const updateKomisiPegawai = async (id, komisiData) => {
  try {
    const response = await useAxios.put(`/komisiPegawai/${id}`, komisiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating komisi pegawai ${id}:`, error);
    throw error;
  }
};

// Hapus data komisi pegawai
export const deleteKomisiPegawai = async (id) => {
  try {
    const response = await useAxios.delete(`/komisiPegawai/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting komisi pegawai ${id}:`, error);
    throw error;
  }
};

// Mendapatkan laporan komisi hunter bulanan
export const getLaporanKomisiHunterBulanan = async (tahun, bulan = null, idPegawai = null) => {
  try {
    let url = `${API_URL}/laporan`;
    const params = new URLSearchParams();
    params.append('tahun', tahun);
    
    if (bulan) {
      params.append('bulan', bulan);
    }
    if (idPegawai) {
      params.append('id_pegawai', idPegawai);
    }
    
    const response = await useAxios.get(`${url}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching laporan komisi hunter bulanan:`, error);
    throw error;
  }
};
