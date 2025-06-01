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
    const response = await useAxios.get(`/pembeli/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPembeliByUserId = async (id_user) => {
  try {
    const response = await useAxios.get(`/pembeli/user/${id_user}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePembeliPoints = async (data) => {
  try {
    console.log("Updating pembeli points with data:", data);
    const response = await useAxios.post(`/pembeli/update-points`, data);
    console.log("Points update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating pembeli points:", error);
    throw error;
  }
};