import useAxios from ".";

const API_URL = "/penitip"

export const getPenitip = async (id) => {
    try {
        const response = await useAxios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};