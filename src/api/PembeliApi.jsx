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
        const response = await useAxios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};