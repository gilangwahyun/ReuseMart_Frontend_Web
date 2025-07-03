import useAxios from ".";

const API_URL = "/detailKeranjang";

export const getAllDetailKeranjang = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDetailKeranjangById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDetailKeranjangByKeranjang = async (id_keranjang) => {
  try {
    const response = await useAxios.get(`${API_URL}/keranjang/${id_keranjang}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDetailKeranjang = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDetailKeranjang = async (id, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDetailKeranjang = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDetailKeranjangByUser = async (userId) => {
  try {
    const response = await useAxios.delete(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
