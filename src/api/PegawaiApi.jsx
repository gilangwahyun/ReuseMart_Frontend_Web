import useAxios from ".";

const API_URL = "/pegawai";

// Mengambil semua data pegawai
export const getAllPegawai = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPegawaiByUserId = async (id_user) => {
  try {
     const response = await useAxios.get(`${API_URL}/user/${id_user}`);
     return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJabatanByUser = async (id_user) => {
  try {
     const response = await useAxios.get(`${API_URL}/user/${id_user}/jabatan`);
     return response;
  } catch (error) {
    throw error;
  }
};

// Mengambil data pegawai berdasarkan ID
export const getPegawaiById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menambahkan data pegawai
export const createPegawai = async (pegawaiData) => {
  try {
    const response = await useAxios.post(API_URL, pegawaiData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate data pegawai
export const updatePegawai = async (id, pegawaiData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, pegawaiData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus data pegawai
export const deletePegawai = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPegawaiByNamaOrJabatan = async (namaOrJabatan) => {
  try {
    const response = await useAxios.get(`${API_URL}/cari-nama-jabatan`, {
      params: {
        keyword: namaOrJabatan,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pegawai by nama or jabatan:', error);
    throw error;
  }
};
