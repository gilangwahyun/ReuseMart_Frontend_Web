import useAxios from ".";

const API_URL = "/klaimMerchandise";

export const getAllKlaimMerchandise = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getKlaimMerchandiseById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getKlaimMerchandiseByPembeli = async (idPembeli) => {
  try {
    const response = await useAxios.get(`${API_URL}/pembeli/${idPembeli}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createKlaimMerchandise = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateKlaimMerchandiseStatus = async (id, status) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, { status_klaim: status });
    return response.data;
  } catch (error) {
    throw error;
  }
};
