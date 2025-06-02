import useAxios from ".";

const API_URL = "/organisasi"

export const createOrganisasi = async (userData) => {
    try {
      console.log("Creating organisasi with data:", userData);
      const response = await useAxios.post(API_URL, userData);
      return response.data;
    } catch (error) {
      console.error("Error creating organisasi:", error);
      throw error;
    }
};

export const getOrganisasi = async () => {
  try {
    console.log("Fetching all organisasi data");
    const response = await useAxios.get(API_URL);
    
    // Validate the response
    if (!response || !response.data) {
      console.error("Invalid response from getOrganisasi:", response);
      return [];
    }
    
    console.log(`Retrieved ${response.data.length} organisasi records`);
    return response.data;
  } catch (error) {
    console.error("Error fetching organisasi:", error);
    // Return empty array instead of throwing to prevent component crashes
    return [];
  }
};

export const updateOrganisasi = async (id, organisasiData) => {
  try {
    console.log(`Updating organisasi ${id} with data:`, organisasiData);
    const response = await useAxios.put(`${API_URL}/${id}`, organisasiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating organisasi ${id}:`, error);
    throw error;
  }
};

export const getOrganisasiById = async (id) => {
  try {
    console.log(`Fetching organisasi with id ${id}`);
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching organisasi ${id}:`, error);
    throw error;
  }
};

export const deleteOrganisasi = async (id) => {
  try {
    console.log(`Deleting organisasi with id ${id}`);
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting organisasi ${id}:`, error);
    throw error;
  }
};

export const getOrganisasiWithoutRequest = async () => {
  try {
    console.log("Fetching organisasi without requests");
    const response = await useAxios.get(`${API_URL}/without-request`);
    
    // Validate the response
    if (!response || !response.data) {
      console.error("Invalid response from getOrganisasiWithoutRequest:", response);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching organisasi without requests:", error);
    // Return empty array instead of throwing
    return [];
  }
};