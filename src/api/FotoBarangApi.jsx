import useAxios from ".";

const API_URL = "/fotoBarang";

// Mendapatkan semua foto untuk 1 barang
export const getFotoBarangByIdBarang = async (id_barang) => {
    try {
        const response = await useAxios.get(`${API_URL}/${id_barang}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// Upload foto barang (harus dalam bentuk FormData)
export const uploadFotoBarang = async (formData) => {
  try {
    const response = await useAxios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFotoBarang = async (id_foto_barang) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id_foto_barang}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFotoBarang = async (id_foto_barang, data) => {
  try {
    const response = await useAxios.put(`/fotoBarang/${id_foto_barang}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};