import useAxios from ".";

const API_URL = "/jadwal";

export const getAllJadwal = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJadwalById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJadwal = async (jadwalData) => {
  try {
    // Map frontend status values to backend expected values
    const statusMapping = {
      "Menunggu Diambil": "Menunggu Diambil",
      "Sedang Dikirim": "Sedang Dikirim", 
      "Sudah Sampai": "Sudah Sampai",
      "Sudah Diambil": "Sudah Diambil"
    };
    
    // Make sure to properly format the data
    const formattedData = {
      ...jadwalData,
      tanggal: jadwalData.tanggal ? jadwalData.tanggal.toString() : "",
      status_jadwal: jadwalData.status_jadwal 
        ? (statusMapping[jadwalData.status_jadwal] || jadwalData.status_jadwal)
        : ""
    };
    
    console.log("Sending jadwal data:", formattedData);
    
    const response = await useAxios.post(API_URL, formattedData);
    return response.data;
  } catch (error) {
    console.error("Error in createJadwal:", error.response?.data || error);
    throw error;
  }
};

export const updateJadwal = async (id, jadwalData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, jadwalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJadwal = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
