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

export const upsertWorkout = async ({token, planId, dayId, entries}) => {
    try {
        const url = `cliente/workout/upsert/${planId}/${dayId}`;
        const res = await axios.put(
            url,
            { entries },
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
        );
        return res.data; // { planId, dayId, entries, updatedAt }
    } catch (err) {
        const msg = err?.response?.data?.error || "Errore salvataggio workout";
        const e = new Error(msg);
        e.status = err?.response?.status;
        throw e;
    }
};