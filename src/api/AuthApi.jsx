import useAxios from ".";

const Register = async (data) => {
  try {
    const response = await useAxios.post("/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const Login = async (data) => {
  try {
    const response = await useAxios.post("/login", data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    localStorage.setItem("user", JSON.stringify(response.data.data));

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const Logout = async () => {
  try {
    const response = await useAxios.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export { Register, Login, Logout };