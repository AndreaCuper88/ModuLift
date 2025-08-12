import axios from "../../src/api/axiosInstance";

export const getClienti = async (token) => {
    try {
        const response = await axios.get(`admin/dashboard/getClienti`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Errore durante il fetch dei clienti:", error);
        throw error;
    }
};