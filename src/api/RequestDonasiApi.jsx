import useAxios from ".";

const API_URL = "/requestDonasi";

export const getAllRequestDonasi = async () => {
  try {
    console.log("Fetching all request donasi");
    const response = await useAxios.get(API_URL);
    
    if (!response || !response.data) {
      console.error("Invalid response from getAllRequestDonasi:", response);
      return { data: [] };
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching all request donasi:", error);
    return { data: [] };
  }
};

export const createRequestDonasi = async (data) => {
  try {
    console.log("Creating request donasi with data:", data);
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating request donasi:", error);
    throw error;
  }
};

export const getRequestDonasiByOrganisasi = async (id_organisasi) => {
  try {
    if (!id_organisasi) {
      console.error("Missing id_organisasi in getRequestDonasiByOrganisasi");
      return { data: [] };
    }
    
    console.log(`Fetching request donasi for organisasi ${id_organisasi}`);
    const response = await useAxios.get(`${API_URL}/organisasi/${id_organisasi}`);
    
    if (!response || !response.data) {
      console.error(`Invalid response for organisasi ${id_organisasi}:`, response);
      return { data: [] };
    }
    
    console.log(`Retrieved ${response.data?.length || 0} request records for organisasi ${id_organisasi}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching request donasi for organisasi ${id_organisasi}:`, error);
    return { data: [] };
  }
};

export const deleteRequestDonasi = async (id) => {
  try {
    console.log(`Deleting request donasi ${id}`);
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting request donasi ${id}:`, error);
    throw error;
  }
};

export const updateRequestDonasi = async (id, data) => {
  try {
    console.log(`Updating request donasi ${id} with data:`, data);
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating request donasi ${id}:`, error);
    throw error;
  }
};

export const updateRequestDonasiByOrganisasi = async (id_organisasi, id_request_donasi, data) => {
  try {
    console.log(`Updating request donasi ${id_request_donasi} for organisasi ${id_organisasi} with data:`, data);
    const response = await useAxios.put(`${API_URL}/organisasi/${id_organisasi}/${id_request_donasi}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating request donasi ${id_request_donasi} for organisasi ${id_organisasi}:`, error);
    throw error;
  }
};

export const deleteRequestDonasiByOrganisasi = async (id_organisasi, id_request_donasi) => {
  try {
    console.log(`Deleting request donasi ${id_request_donasi} for organisasi ${id_organisasi}`);
    const response = await useAxios.delete(`${API_URL}/organisasi/${id_organisasi}/${id_request_donasi}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting request donasi ${id_request_donasi} for organisasi ${id_organisasi}:`, error);
    throw error;
  }
};

export const createRequestDonasiByOrganisasi = async (id_organisasi, data) => {
  try {
    console.log(`Creating request donasi for organisasi ${id_organisasi} with data:`, data);
    const response = await useAxios.post(`${API_URL}/organisasi/${id_organisasi}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating request donasi for organisasi ${id_organisasi}:`, error);
    throw error;
  }
};