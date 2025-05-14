import useAxios from ".";

const API_URL = "/requestDonasi";

export const getAllRequestDonasi = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};