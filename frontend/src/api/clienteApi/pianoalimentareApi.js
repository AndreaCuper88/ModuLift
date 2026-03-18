import axios from "../../api/axiosInstance";

export const getLatestPiano = async (token) => {
    try {
        const response = await axios.get(`/cliente/pianoAlimentare/latest`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (err) {
        console.error("Errore getLatestPiano:", err.response?.data || err.message);

        throw new Error(
            err.response?.data?.message || "Errore recupero piano alimentare"
        );
    }
};