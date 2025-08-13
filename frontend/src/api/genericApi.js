import axios from "../../src/api/axiosInstance";

// [GET] /api/admin/generic/getCliente
export const getCliente = async (id,token) => {
    try {
        const response = await axios.get(`generic/getCliente/${id}`, {
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