import useAxios from ".";

const API_URL = "/alamat"

export const createAlamat = async (data) => {
    try {
      const response = await useAxios.post(API_URL, data);
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const getAlamat = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data; // Assuming the data is in response.data
  } catch (error) {
    throw error;
  }
};

export const updateAlamat = async (id, alamatData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, alamatData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAlamatById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAlamatByPembeliId = async (id_pembeli) => {
  try {
    const response = await useAxios.get(`/alamat/pembeli/${id_pembeli}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteAlamat = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data; // Assuming the API returns some data
  } catch (error) {
    throw error;
  }
};