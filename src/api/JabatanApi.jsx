import axios from 'axios';

export const getJabatanByPegawai = async (id_pegawai) => {
  return axios.get(`http://localhost:8000/api/jabatan/pegawai/${id_pegawai}`);
};

