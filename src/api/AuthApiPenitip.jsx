import useAxios from ".";

export const registerPenitip = async (data) => {
  try {
    const response = await useAxios.post("/register-penitip", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
