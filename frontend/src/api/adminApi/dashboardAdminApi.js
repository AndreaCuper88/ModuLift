import axios from "../axiosInstance";

export const getCountPiani = async (token) =>{
    try {
        const response = await axios.get(`admin/dashboard/getCountPiani`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Errore durante il count dei piani:", error);
        throw error;
    }
}

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