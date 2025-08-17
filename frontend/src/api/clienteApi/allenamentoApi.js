import axios from "../../api/axiosInstance";

export const getWorkoutPlanById = async (planId, token) => {
    try {
        const res = await axios.get(`/cliente/workout/plan/${planId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.data; // oggetto piano workout
    } catch (err) {
        const e = new Error(err?.response?.data?.message || "Errore recupero piano workout");
        e.status = err?.response?.status;
        throw e;
    }
};
