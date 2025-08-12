import axios from "../../src/api/axiosInstance";

export const getCliente = async (id,token) => {
    try {
        const response = await axios.get(`admin/editorSchede/getCliente/${id}`, {
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
        const response = await axios.get(`admin/editorSchede/getExercises`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Errore durante il fetch degli esercizi:", error);
    }
}

export const createExercise = async (exercise, token) => {
    try {
        const res = await axios.post("admin/editorSchede/createExercise", exercise, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data;
    } catch (error) {
        console.error("Errore durante la creazione dell'esercizio:", error);
    }
}

export const uploadExerciseImage = async (file, muscle, token) => {
    try {
        const formData = new FormData(); //Creo un'istanza di FormData
        formData.append('muscle', muscle);
        formData.append('file', file);  //Vi aggiungo il file

        const res = await axios.post("uploads/uploadExerciseImage", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (e) {
        console.error("Errore durante il caricamento dell'immagine: ",e);
    }
}

export const deleteExercise = async (id, token) => {
    try {
        const res = await axios.delete(
            `admin/editorSchede/removeExercise/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log(res.data.message);
        return res.data;
    } catch (error) {
        console.error("Errore durante l'eliminazione:", error.response?.data || error.message);
        throw error;
    }
}

export const upsertPlan = async (payload, token) => {
    try {
        const res = await axios.post(
            "admin/editorSchede/upsertPlan",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return res.data;
    } catch (error) {
        console.error("Errore durante la creazione/modifica del piano: ", error);
    }
}

export const loadPlan = async (userId,token) => {
    try {
        const res = await axios.get(
            `admin/editorSchede/loadPlan/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return res.data;
    } catch (e) {
        console.error("Errore durante il recupero del piano: ", e);
    }
}