import axios from 'axios';

const API_URL = 'http://localhost:8000/api/requestDonasi';

export const getRequestDonasi = async () => {
  return axios.get(API_URL);
};

export const createRequestDonasi = async (data) => {
  return axios.post(API_URL, data);
};

export const getRequestDonasiByOrganisasi = async (id_organisasi) => {
  return axios.get(`http://localhost:8000/api/requestDonasi/organisasi/${id_organisasi}`);
};

export const deleteRequestDonasi = async (id) => {
  return axios.delete(`http://localhost:8000/api/requestDonasi/${id}`);
};

export const updateRequestDonasi = async (id, data) => {
  return axios.put(`http://localhost:8000/api/requestDonasi/${id}`, data);
};

export const updateRequestDonasiByOrganisasi = async (id_organisasi, id_request_donasi, data) => {
  return axios.put(`http://localhost:8000/api/requestDonasi/organisasi/${id_organisasi}/${id_request_donasi}`, data);
};

export const deleteRequestDonasiByOrganisasi = async (id_organisasi, id_request_donasi) => {
  return axios.delete(`http://localhost:8000/api/requestDonasi/organisasi/${id_organisasi}/${id_request_donasi}`);
};

export const createRequestDonasiByOrganisasi = async (id_organisasi, data) => {
  return axios.post(`http://localhost:8000/api/requestDonasi/organisasi/${id_organisasi}`, data);
};
