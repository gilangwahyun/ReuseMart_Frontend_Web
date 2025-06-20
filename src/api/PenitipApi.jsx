import useAxios from ".";

const API_URL = "/penitip";

export const registerPenitip = async (data) => {
  try {
    // This endpoint should create both User and Penitip records
    const response = await useAxios.post("/register-penitip", data, {
      headers: {
        'Content-Type': 'multipart/form-data' // Important for file uploads
      }
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Create penitip (untuk digunakan di CRUD seperti di PegawaiManagement)
export const createPenitip = async (data) => {
  try {
    const response = await useAxios.post(API_URL, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Create penitip error:", error);
    throw error;
  }
};

// Tampilkan semua penitip
export const getAllPenitip = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tampilkan penitip berdasarkan ID
export const getPenitipById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tampilkan penitip berdasarkan ID user
export const getPenitipByUserId = async (id_user) => {
  try {
    // Add ?include=user to get the user data in the response
    const response = await useAxios.get(`${API_URL}/user/${id_user}?include=user`);
    
    // If user data is not included in the response, add it manually
    if (response.data && !response.data.user) {
      console.log("User data not included in response, fetching user data separately");
      try {
        const userResponse = await useAxios.get(`/user/${id_user}`);
        if (userResponse.data) {
          response.data.user = userResponse.data;
        }
      } catch (userError) {
        console.error("Failed to fetch user data:", userError);
        // Add empty user object to prevent errors
        response.data.user = { email: "Email tidak tersedia" };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error mengambil data penitip untuk user ID ${id_user}:`, error);
    throw error;
  }
};

// Update penitip
export const updatePenitip = async (id, data) => {
  try {
    // Cek apakah data adalah instance dari FormData
    const isFormData = data instanceof FormData;
    
    const response = await useAxios.put(`/penitip/${id}`, data, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data'
      } : {}
    });
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
    // Try a specific search endpoint that might be available in your API
    const response = await useAxios.get(`/penitip/search?nama_penitip=${encodeURIComponent(nama_penitip)}`);
    return response.data;
  } catch (error) {
    console.error("Search error:", error);
    // If that fails, try an alternative approach with the original endpoint
    try {
      const allPenitip = await getAllPenitip();
      // Implement client-side filtering as a fallback
      return allPenitip.filter(penitip => 
        penitip.nama_penitip && 
        penitip.nama_penitip.toLowerCase().includes(nama_penitip.toLowerCase())
      );
    } catch (secondError) {
      console.error("Fallback search error:", secondError);
      throw secondError;
    }
  }
};

export const getRated = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/avg-rate/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const publicShow = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/public-show/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tambahkan fungsi baru untuk mendapatkan data penitipan berdasarkan ID penitip
export const getPenitipanByPenitipId = async (id_penitip, include = '') => {
  try {
    let url = `${API_URL}/${id_penitip}/penitipan`;
    
    // Tambahkan parameter include jika ada
    if (include) {
      url += `?include=${include}`;
    }
    
    const response = await useAxios.get(url);
    return response;  // Return full response object to maintain compatibility
  } catch (error) {
    console.error(`Error mengambil data penitipan untuk penitip ID ${id_penitip}:`, error);
    throw error;
  }
};

// Tambahkan fungsi baru untuk mendapatkan data transaksi dan nota penjualan penitip
export const getPenitipTransaksiNota = async (id_penitip) => {
  try {
    // Mendapatkan data penitipan dengan barang dan detail transaksi
    const response = await useAxios.get(`${API_URL}/${id_penitip}/transaksi-nota`);
    return response.data;
  } catch (error) {
    console.error(`Error mengambil data transaksi dan nota untuk penitip ID ${id_penitip}:`, error);
    throw error;
  }
};

// Tambahkan fungsi baru untuk mendapatkan transaksi berdasarkan ID penitip
export const getTransaksiByPenitipId = async (id_penitip) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id_penitip}/transaksi`);
    return response.data;
  } catch (error) {
    console.error(`Error mengambil transaksi untuk penitip ID ${id_penitip}:`, error);
    return [];
  }
};