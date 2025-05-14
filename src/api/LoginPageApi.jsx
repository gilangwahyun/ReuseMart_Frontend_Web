import axios from "axios";
export const BASE_URL = "http://127.0.0.1:8000"

const useAxios = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor
useAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token; // Token sudah termasuk 'Bearer'
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor untuk handle 401 (Unauthorized)
useAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default useAxios;