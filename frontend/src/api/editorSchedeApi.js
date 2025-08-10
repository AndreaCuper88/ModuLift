import axios from "../../src/api/axiosInstance";

export const getCliente = async (id,token) => {
    try {
        const response = await axios.get(`editorSchede/getCliente/${id}`, {
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

export const getExercises = async (token) => {
    try {
        const response = await axios.get(`editorSchede/getExercises`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Errore durante il fetch degli esercizi:", error);
    }
}