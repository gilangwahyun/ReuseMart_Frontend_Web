import useAxios from ".";

const API_URL = "/organisasi"

export const createOrganisasi = async (userData) => {
    try {
      const response = await useAxios.post(API_URL, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const getOrganisasi = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data; // Assuming the data is in response.data
  } catch (error) {
    throw error;
  }
};

export const updateOrganisasi = async (id, organisasiData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, organisasiData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrganisasiById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOrganisasi = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrganisasiWithoutRequest = async () => {
  try {
    const response = await useAxios.get(`${API_URL}/without-request`);
    return response.data;
  } catch (error) {
    throw error;
  }
};