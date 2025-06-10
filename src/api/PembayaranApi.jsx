import useAxios from ".";

const API_URL = "/pembayaran";

export const createPembayaran = async (formData) => {
  try {
    const response = await useAxios.post('/pembayaran', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusVerifikasi = async (id_pembayaran, status) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id_pembayaran}/status-verifikasi`, {
      status_verifikasi: status
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllPembayaranCS = async () => {
  try {
    const response = await useAxios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};