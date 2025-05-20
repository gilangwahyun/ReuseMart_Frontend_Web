import axios from "axios";
export const BASE_URL = "http://127.0.0.1:8000";

const useAxios = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 10000, // Adding a timeout of 10 seconds
});

// Helper function for better error logging
const logError = (prefix, error) => {
  console.error(`${prefix}:`, error);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
    console.error('Headers:', error.response.headers);
  } else if (error.request) {
    console.error('Request made but no response:', error.request);
    if (error.message && error.message.includes('timeout')) {
      console.error('Request timed out. Server might be down or unreachable.');
    } else if (error.message && error.message.includes('Network Error')) {
      console.error('Network error. API server might be down or CORS issues.');
    }
  } else {
    console.error('Error in setup:', error.message);
  }
  if (error.config) {
    console.error('Request URL:', error.config.url);
    console.error('Request Method:', error.config.method);
  }
};

// Interceptor untuk menambahkan token ke setiap request
useAxios.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token ditambahkan:", token.substring(0, 10) + "...");
      }
      return config;
    } catch (error) {
      console.error("Error mengambil token:", error);
      return config;
    }
  },
  (error) => {
    logError("Error pada request", error);
    return Promise.reject(error);
  }
);

// Interceptor untuk logging respons
useAxios.interceptors.response.use(
  (response) => {
    console.log(`Response ${response.config.method.toUpperCase()} ${response.config.url}:`, 
      response.status);
    return response;
  },
  (error) => {
    logError('Error pada response', error);
    
    // Add custom error message
    const customError = new Error(
      error.response?.data?.message || 
      'Terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.'
    );
    customError.originalError = error;
    customError.status = error.response?.status;
    
    return Promise.reject(customError);
  }
);

export default useAxios;