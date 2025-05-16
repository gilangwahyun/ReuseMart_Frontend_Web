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

    // Pastikan response.data ada dan memiliki token
    if (response && response.data) {
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      localStorage.setItem("user", JSON.stringify(response.data.data));
    } else {
      console.error('Data tidak ditemukan dalam response:', response);
      throw new Error('Data tidak ditemukan dalam response.');
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || error;
  }
};

const Logout = async () => {
  try {
    const response = await useAxios.post("/logout");
    console.log("Logout response:", response); // Tambahkan log untuk mengecek response API
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error.response?.data || error;
  }
};

export { Register, Login, Logout };