// src/api/pianoAlimentareApi.js
import axios from "../axiosInstance";

export const getMyLatestPiano = async (token) => {
    try {
        const res = await axios.get("/cliente/utils/latestPiano", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        return res.data;
    } catch (err) {
        const e = new Error(err?.response?.data?.message || "Errore recupero piano più recente");
        e.status = err?.response?.status;
        throw e;
    }
};
