import useAxios from ".";

const API_URL = "/jadwal";

export const getAllJadwal = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJadwalById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJadwal = async (jadwalData) => {
  try {
    const response = await useAxios.post(API_URL, jadwalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJadwal = async (id, jadwalData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, jadwalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJadwal = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
