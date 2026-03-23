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

export const getCountSchede = async (token) => {
    try {
        const response = await axios.get(`admin/dashboard/getCountSchede`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Errore durante il count delle schede:", error);
        throw error;
    }
};

export const getCountPianiAlimentari = async (token) => {
    try {
        const response = await axios.get(`admin/dashboard/getCountPianiAlimentari`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Errore durante il count dei piani alimentari:", error);
        throw error;
    }
};