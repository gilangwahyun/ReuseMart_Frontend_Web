import axios from "axios";
export const BASE_URL = "http://127.0.0.1:8000"

const useAxios = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Accept': 'application/json',
  },
  // Tambahkan withCredentials jika API menggunakan session/cookies
  // withCredentials: true,
});

// Tambahkan interceptor untuk logging
useAxios.interceptors.request.use(
  (config) => {
    console.log('Request keluar:', config);
    return config;
  },
  (error) => {
    console.error('Error pada request:', error);
    return Promise.reject(error);
  }
);

useAxios.interceptors.response.use(
  (response) => {
    console.log('Response masuk:', response);
    return response;
  },
  (error) => {
    console.error('Error pada response:', error);
    if (error.response) {
      // Server memberikan respons dengan status error
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      console.error('Request tanpa response:', error.request);
    } else {
      // Kesalahan dalam membuat request
      console.error('Error lainnya:', error.message);
    }
    return Promise.reject(error);
  }
);

export default useAxios;