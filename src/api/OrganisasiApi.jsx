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