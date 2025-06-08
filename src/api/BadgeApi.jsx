import useAxios from ".";

const API_URL = "/badge";

export const getAllBadge = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBadgeById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBadge = async (badgeData) => {
  try {
    const response = await useAxios.post(API_URL, badgeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBadge = async (id, badgeData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, badgeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBadge = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setTopSeller = async () => {
  try {
    const response = await useAxios.post(`${API_URL}/set-top-seller`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTopSeller = async () => {
  try {
    const response = await useAxios.get(`${API_URL}/get-top-seller`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
