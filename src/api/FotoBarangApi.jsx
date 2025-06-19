import useAxios from ".";

const API_URL = "/fotoBarang";

// Mendapatkan semua foto untuk 1 barang
export const getFotoBarangByIdBarang = async (id_barang) => {
    try {
        const response = await useAxios.get(`${API_URL}/${id_barang}`);
        if (response.data && response.data.success) {
            console.log('Foto barang response:', response.data);
            return response.data.data;
        }
        console.warn('Invalid foto barang response:', response.data);
        return [];
    } catch (error) {
        console.error('Error fetching foto barang:', error);
        return [];
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