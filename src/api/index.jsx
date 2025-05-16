import axios from "axios";
export const BASE_URL = "http://127.0.0.1:8000";

const useAxios = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Accept': 'application/json',
  },

});

// Interceptor untuk menambahkan token ke setiap request
useAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token ditambahkan:", token);
    }
    return config;
  },
  (error) => {
    console.error("Error pada request:", error);
    return Promise.reject(error);
  }
);

// Interceptor untuk logging respons
useAxios.interceptors.response.use(
  (response) => {
    console.log('Response masuk:', response);
    return response;
  },
  (error) => {
    console.error('Error pada response:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request tanpa response:', error.request);
    } else {
      console.error('Error lainnya:', error.message);
    }
    return Promise.reject(error);
  }
);

export default useAxios;