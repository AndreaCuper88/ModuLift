import axios from "../../src/api/axiosInstance";

// [GET] /api/users/:userId/getAge ed eventualmente ?at=2023-08-16
export const getUserAge = async (userId, at, token) => {
    try {
        const res = await axios.get(
            `/api/users/${userId}/age`,
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
