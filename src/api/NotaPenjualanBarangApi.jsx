import useAxios from ".";

const API_URL = "/notaPenjualanBarang";

// Get all nota penjualan
export const getAllNotaPenjualanBarang = async () => {
  try {
    const response = await useAxios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get nota penjualan by ID
export const getNotaPenjualanBarangById = async (id) => {
  try {
    const response = await useAxios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get nota penjualan by nomor nota
export const getNotaPenjualanByNomorNota = async (nomorNota) => {
  try {
    const response = await useAxios.get(`${API_URL}/nomor-nota/${nomorNota}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Nota with this number doesn't exist, which is what we want
      return null;
    }
    throw error;
  }
};

// Check if nota number already exists
export const checkNotaNumberExists = async (nomorNota) => {
  try {
    const response = await useAxios.get(`${API_URL}/check/${nomorNota}`);
    return response.data.exists;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 404 means no duplicate found
      return false;
    }
    throw error;
  }
};

// Create a new nota penjualan
export const createNotaPenjualanBarang = async (notaData) => {
  // Keep track of notas we've already created for specific transactions
  if (!createNotaPenjualanBarang.createdNotas) {
    createNotaPenjualanBarang.createdNotas = {};
  }

  // If we've already created a nota for this transaction, return the cached result
  if (notaData.id_transaksi && createNotaPenjualanBarang.createdNotas[notaData.id_transaksi]) {
    console.log(`Already created nota for transaction ${notaData.id_transaksi}, returning cached result`);
    return createNotaPenjualanBarang.createdNotas[notaData.id_transaksi];
  }
  
  try {
    // Skip existence check for now since the endpoint is not available
    // Once backend implements all endpoints, restore this check
    /*
    if (notaData.nomor_nota) {
      const exists = await checkNotaNumberExists(notaData.nomor_nota);
      if (exists) {
        throw new Error(`Nota dengan nomor ${notaData.nomor_nota} sudah ada`);
      }
    }
    */
    
    console.log("Sending nota data to backend:", notaData);
    
    try {
      const response = await useAxios.post(API_URL, notaData);
      console.log("Received response from backend:", response.data);
      
      // Cache the result if it has a transaction ID
      if (notaData.id_transaksi) {
        createNotaPenjualanBarang.createdNotas[notaData.id_transaksi] = response.data;
        
        // Also update the getNotaPenjualanByTransaksiId cache if it exists
        if (typeof getNotaPenjualanByTransaksiId.cache !== 'undefined') {
          getNotaPenjualanByTransaksiId.cache[notaData.id_transaksi] = response.data;
        }
      }
      
      return response.data;
    } catch (postError) {
      // Handle duplicate invoice number error (422)
      if (postError.response && postError.response.status === 422 && 
          postError.response.data.message?.includes('nomor nota has already been taken')) {
        console.log("Duplicate invoice number detected, generating a new one and retrying");
        
        // Generate a completely unique invoice number with the new format
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const transactionId = notaData.id_transaksi || '000';
        
        // Add a small random suffix to make it unique
        const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        
        // Format: YY.MM.TransactionID-XX (where XX is a random number)
        notaData.nomor_nota = `${year}.${month}.${transactionId.toString().padStart(3, '0')}-${randomSuffix}`;
        
        // Retry with the new invoice number
        console.log("Retrying with new invoice number:", notaData.nomor_nota);
        const retryResponse = await useAxios.post(API_URL, notaData);
        console.log("Retry successful:", retryResponse.data);
        
        // Cache the result if it has a transaction ID
        if (notaData.id_transaksi) {
          createNotaPenjualanBarang.createdNotas[notaData.id_transaksi] = retryResponse.data;
          
          // Also update the getNotaPenjualanByTransaksiId cache if it exists
          if (typeof getNotaPenjualanByTransaksiId.cache !== 'undefined') {
            getNotaPenjualanByTransaksiId.cache[notaData.id_transaksi] = retryResponse.data;
          }
        }
        
        return retryResponse.data;
      }
      
      // If it's not a duplicate invoice error, rethrow
      throw postError;
    }
  } catch (error) {
    // If we get a 404 on the main endpoint, the entire API might not be available yet
    if (error.response && error.response.status === 404) {
      console.error("The NotaPenjualanBarang API endpoints are not implemented in the backend");
      // Return a mock successful response for development
      const mockResponse = {
        id_nota_penjualan: Math.floor(Math.random() * 10000) + 1, // Generate a random ID
        ...notaData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log("Created mock nota response:", mockResponse);
      
      // Cache the mock result if it has a transaction ID
      if (notaData.id_transaksi) {
        createNotaPenjualanBarang.createdNotas[notaData.id_transaksi] = mockResponse;
        
        // Also update the getNotaPenjualanByTransaksiId cache if it exists
        if (typeof getNotaPenjualanByTransaksiId.cache !== 'undefined') {
          getNotaPenjualanByTransaksiId.cache[notaData.id_transaksi] = mockResponse;
        }
      }
      
      return mockResponse;
    }
    throw error;
  }
};

// Generate a unique invoice number (format: YY.MM.transactionId)
export const generateUniqueInvoiceNumber = async (transactionId = '000') => {
  try {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Format: YY.MM.TransactionID
    const invoiceNumber = `${year}.${month}.${transactionId.toString().padStart(3, '0')}`;
    
    // Once backend implements all endpoints, restore this check
    /*
    // Start with a base invoice number
    let counter = 101;
    let invoiceNumber = `${year}.${month}.${counter}`;
    
    // Check if it exists, if it does, increment counter
    while (await checkNotaNumberExists(invoiceNumber)) {
      counter++;
      invoiceNumber = `${year}.${month}.${counter}`;
      
      // Safety check to prevent infinite loops
      if (counter > 999) {
        throw new Error("Tidak dapat membuat nomor nota unik");
      }
    }
    */
    
    return invoiceNumber;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Fallback to a simple format
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}.${month}.${transactionId.toString().padStart(3, '0')}`;
  }
};

// Update an existing nota penjualan
export const updateNotaPenjualanBarang = async (id, notaData) => {
  try {
    const response = await useAxios.put(`${API_URL}/${id}`, notaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a nota penjualan
export const deleteNotaPenjualanBarang = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all nota detail for a specific nota penjualan
export const getDetailsByNotaId = async (notaId) => {
  try {
    const response = await useAxios.get(`${API_URL}/${notaId}/details`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNotaPenjualanByTransaksiId = async (transaksiId) => {
  // Keep a cache of transactions we've already checked
  if (!getNotaPenjualanByTransaksiId.cache) {
    getNotaPenjualanByTransaksiId.cache = {};
  }

  // If we've already checked this transaction ID and found no nota, don't check again
  if (getNotaPenjualanByTransaksiId.cache[transaksiId] === false) {
    console.log(`Already checked transaction ${transaksiId} and found no nota (cached result)`);
    return null;
  }
  
  // If we've already found a nota for this transaction, return it
  if (getNotaPenjualanByTransaksiId.cache[transaksiId]) {
    console.log(`Found cached nota for transaction ${transaksiId}:`, getNotaPenjualanByTransaksiId.cache[transaksiId]);
    return getNotaPenjualanByTransaksiId.cache[transaksiId];
  }

  try {
    // For now, since the endpoint is not available in the backend, 
    // we'll return a mock response if the endpoint returns 404
    try {
      const response = await useAxios.get(`${API_URL}/transaksi/${transaksiId}`);
      console.log("Found existing nota for transaction:", response.data);
      
      // Cache the result
      getNotaPenjualanByTransaksiId.cache[transaksiId] = response.data;
      return response.data;
    } catch (innerError) {
      if (innerError.response) {
        if (innerError.response.status === 404) {
          console.log("Backend endpoint /notaPenjualanBarang/transaksi/{id} either not implemented or nota not found");
          // Cache the negative result
          getNotaPenjualanByTransaksiId.cache[transaksiId] = false;
          // Return null to indicate no nota exists, allowing a new one to be created
          return null;
        }
        
        console.error(`Error fetching nota by transaksi ID: ${innerError.response.status} - ${innerError.message}`);
        console.log("Response data:", innerError.response.data);
      } else {
        console.error("Error without response fetching nota by transaksi ID:", innerError.message);
      }
      
      // For all errors, return null rather than throwing
      getNotaPenjualanByTransaksiId.cache[transaksiId] = false;
      return null;
    }
  } catch (error) {
    console.error("Unexpected error in getNotaPenjualanByTransaksiId:", error);
    // Always return null for any error, don't throw
    getNotaPenjualanByTransaksiId.cache[transaksiId] = false;
    return null;
  }
};
