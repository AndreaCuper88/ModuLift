import axios from "../../src/api/axiosInstance";

export const savePianoAlimentare = async (token, data) => {
    try {
        const res = await axios.post(
            "admin/pianoAlimentare/createPiano",
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    } catch (err) {
        const status = err?.response?.status;
        if (status === 400) throw new Error("Dati non validi: title e meals sono obbligatori");
        if (status === 401) throw new Error("Non autenticato");
        if (status === 409) throw new Error("Titolo già usato per questo utente");
        throw new Error(err?.response?.data?.message || "Errore salvataggio piano");
    }
};

export const getLatestPiano = async (token, userId) => {
    try {
        const res = await axios.get(
            "/admin/pianoAlimentare/getLatestPiano",
            {
                params: { userId },
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (res.status === 204) return null; // nessun piano
        return res.data;                      // piano trovato
    } catch (err) {
        const msg = err?.response?.data?.message || "Errore recupero piano";
        const e = new Error(msg);
        e.status = err?.response?.status;
        throw e;
    }
};