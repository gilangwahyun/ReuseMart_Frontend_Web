import useAxios from ".";

export const registerPenitip = async (data) => {
  try {
    const response = await useAxios.post("/penitip", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tampilkan semua penitip
export const getAllPenitip = async () => {
  try {
    console.log("Memanggil API endpoint: /penitip");
    const response = await useAxios.get("/penitip");
    console.log("Response dari API /penitip:", response);
    
    // Check if response has data property
    if (response && response.data !== undefined) {
      return response.data;
    } else {
      console.error("Respons API tidak memiliki property data:", response);
      return [];
    }
  } catch (error) {
    console.error("Error saat memanggil API getAllPenitip:", error);
    // Re-throw error for caller to handle
    throw error;
  }
};

// Tampilkan penitip berdasarkan ID
export const getPenitipById = async (id) => {
  try {
    console.log(`Memanggil API endpoint: /penitip/${id}`);
    const response = await useAxios.get(`/penitip/${id}`);
    console.log(`Response dari API /penitip/${id}:`, response);
    return response.data;
  } catch (error) {
    console.error(`Error saat memanggil API getPenitipById(${id}):`, error);
    throw error;
  }
};

// Update penitip
export const updatePenitip = async (id, data) => {
  try {
    const response = await useAxios.put(`/penitip/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error saat update penitip ID ${id}:`, error);
    throw error;
  }
};

// Hapus penitip
export const deletePenitip = async (id) => {
  try {
    const response = await useAxios.delete(`/penitip/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error saat hapus penitip ID ${id}:`, error);
    throw error;
  }
};

export const searchPenitipByName = async (nama_penitip) => {
  try {
    const response = await useAxios.get(`/penitip?nama_penitip=${encodeURIComponent(nama_penitip)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
