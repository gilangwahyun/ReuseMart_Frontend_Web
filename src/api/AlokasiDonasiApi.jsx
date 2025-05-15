import useAxios from ".";

const API_URL = "/alokasiDonasi";

export const getAllAlokasiDonasi = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAlokasiDonasi = async (alokasiDonasiData) => {
  try {
    const response = await useAxios.post(API_URL, alokasiDonasiData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAlokasiDonasi = async (id, alokasiDonasiData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, alokasiDonasiData);
    return response.data;
  } catch (error) {
    console.error("Error updating alokasi donasi:", error);
    throw error;
  }
};

export const searchByOrganisasi = async (organisasiName) => {
  try {
    const response = await useAxios.get(`${API_URL}/cari-organisasi`, {
      params: {
        organisasi: organisasiName,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching alokasi donasi by organisasi:', error);
    throw error;
  }
};
