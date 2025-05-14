import useAxios from ".";

const API_URL = "/user"

export const loginUser = async (email, password) => {
  try {
    const response = await useAxios.post('login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await useAxios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

