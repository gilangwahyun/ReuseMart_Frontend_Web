import useAxios from ".";

const API_URL = "/pembeli"

export const createPembeli = async (userData) => {
    try {
      console.log("Mengirim request createPembeli dengan data:", userData);
      const response = await useAxios.post(API_URL, userData);
      console.log("Response createPembeli berhasil:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error pada createPembeli:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("Request error, tidak ada response:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
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

export const updatePembeli = async (id, pembeliData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, pembeliData);
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