import useAxios from ".";

const API_URL = "/jabatan";

export const getAllJabatan = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJabatanByPegawai = async (id_pegawai) => {
  try {
    const response = await useAxios.get(`${API_URL}/pegawai/${id_pegawai}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJabatanById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJabatan = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJabatan = async (id, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJabatan = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
