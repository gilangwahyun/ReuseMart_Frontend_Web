import useAxios from ".";

const API_URL = "/keranjang";

export const getAllKeranjang = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getKeranjangById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getKeranjangByIdUser = async (id_user) => {
  try {
    const response = await useAxios.get(`${API_URL}/user/${id_user}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getKeranjangByPembeli = async (id_pembeli) => {
  try {
    const response = await useAxios.get(`${API_URL}/pembeli/${id_pembeli}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const createKeranjang = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteKeranjang = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
