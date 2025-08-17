import axios from "../../src/api/axiosInstance";

// [GET] /api/users/:userId/getAge ed eventualmente ?at=2023-08-16
export const getUserAge = async (userId, at, token) => {
    try {
        const res = await axios.get(
            `/users/${userId}/getAge`,
            {
                params: at ? { at } : undefined, // aggiungo alla query string la data se mi serve
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return res.data; // { age, birthDate, referenceDate }
    } catch (err) {
        const msg = err?.response?.data?.message || "Errore recupero età utente";
        const e = new Error(msg);
        e.status = err?.response?.status;
        throw e;
    }
};

export const getUserSex = async (userId, token) => {
    try {
        const res = await axios.get(
            `/users/${userId}/getSex`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return res.data; // { sex }
    } catch (err) {
        const msg = err?.response?.data?.message || "Errore recupero sesso utente";
        const e = new Error(msg);
        e.status = err?.response?.status;
        throw e;
    }
};
export const getUserHeight = async (userId, token) => {
    try {
        const res = await axios.get(
            `/users/${userId}/getHeight`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return res.data; // { altezza }
    } catch (err) {
        const msg = err?.response?.data?.message || "Errore recupero sesso utente";
        const e = new Error(msg);
        e.status = err?.response?.status;
        throw e;
    }
};

export const upsertMisure = async (payload, token) => {
    try {
        const res = await axios.post(
            "/admin/misure/upsertMisure",
            payload,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
        );
        return res.data;
    } catch (err) {
        const e = new Error(err?.response?.data?.message || "Errore upsert misure");
        e.status = err?.response?.status;
        throw e;
    }
};

export const getEntriesByUser = async (userId, token) => {
    try {
        const res = await axios.get(`/admin/misure/getEntries/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.data; // array di entries
    } catch (err) {
        const e = new Error(err?.response?.data?.message || "Errore caricamento misure utente");
        e.status = err?.response?.status;
        throw e;
    }
};