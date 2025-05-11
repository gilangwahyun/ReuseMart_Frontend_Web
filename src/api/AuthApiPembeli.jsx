import useAxios from ".";

const API_URL = "/register"

export const createUser = async (userData) => {
    try {
      const response = await useAxios.post(API_URL, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
};