import useAxios from ".";

const API_URL = "/pembeli"

export const createPembeli = async (userData) => {
    try {
      const response = await useAxios.post(API_URL, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const getPembeli = async (id) => {
  try {
    const response = await useAxios.get(`/pembeli/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPembeliByUserId = async (id_user) => {
  try {
    const response = await useAxios.get(`/pembeli/user/${id_user}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePembeli = async (id, pembeliData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, pembeliData);
    return response.data;
  } catch (error) {
    throw error;
  }
};