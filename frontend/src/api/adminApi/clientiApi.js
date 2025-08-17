import axios from "../axiosInstance";

export const getClienti = async (token) => {
    try {
        const response = await axios.get("admin/clienti/getClienti", {
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

export const disableCliente = async (id, token) => {
    try {
        const { data } = await axios.patch(
            `admin/clienti/${id}/disable`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    } catch (e) {
        console.error("Errore durante la disattivazione cliente:", e);
        throw e;
    }
}

export const deleteCliente = async (id, token) => {
    try {
        const { data } = await axios.delete(`admin/clienti/${id}/delete`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    } catch (e) {
        console.error("Errore durante l'eliminazione cliente:", e);
        throw e;
    }
}