import axios from 'axios';

export const getPegawaiByUserId = async (id_user) => {
  return axios.get(`http://localhost:8000/api/pegawai/user/${id_user}`);
};

export const getJabatanByUser = async (id_user) => {
  return axios.get(`http://localhost:8000/api/pegawai/user/${id_user}/jabatan`);
};
