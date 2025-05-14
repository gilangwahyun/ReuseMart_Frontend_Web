import useAxios from ".";

const API_URL = "/penitipanBarang"

export const getHistoryByPenitipId = async (id) => {
    try {
        const response = await useAxios.get(`${API_URL}/penitip/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};