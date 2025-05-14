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

export const createRequestDonasi = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRequestDonasiByOrganisasi = async (id_organisasi) => {
  try {
    const response = await useAxios.get(`${API_URL}/organisasi/${id_organisasi}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRequestDonasi = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRequestDonasi = async (id, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRequestDonasiByOrganisasi = async (id_organisasi, id_request_donasi, data) => {
  try {
    const response = await useAxios.put(`${API_URL}/organisasi/${id_organisasi}/${id_request_donasi}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRequestDonasiByOrganisasi = async (id_organisasi, id_request_donasi) => {
  try {
    const response = await useAxios.delete(`${API_URL}/organisasi/${id_organisasi}/${id_request_donasi}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRequestDonasiByOrganisasi = async (id_organisasi, data) => {
  try {
    const response = await useAxios.post(`${API_URL}/organisasi/${id_organisasi}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};