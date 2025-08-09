import axios from 'axios';

// Creo un'istanza personalizzata di Axios per centralizzare baseURL, header comuni e timeout.
// In questo modo posso anche attaccare interceptor senza toccare axios globale.
const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

/* ===========================
   REQUEST INTERCEPTOR
   ===========================
   Prima di OGNI richiesta leggo l'ultimo accessToken da localStorage
   e lo metto nell'header Authorization.
   Questo evita il problema del "token congelato" sui defaults.
*/
axiosInstance.interceptors.request.use((config) => {
    const t = localStorage.getItem('accessToken');
    // Mi assicuro che gli headers esistano (alcuni adapter possono non settarli).
    config.headers = config.headers || {};
    if (t) {
        config.headers['Authorization'] = 'Bearer ' + t;
    } else {
        // Se non ho token, mi tolgo l'Authorization per evitare header sporchi.
        delete config.headers['Authorization'];
    }
    return config;
});

// Flag per evitare più refresh in parallelo: quando è true, accodo le richieste.
let isRefreshing = false;

// Coda delle richieste fallite con 401 mentre sto facendo refresh.
// Le "parcheggio" qui e le risveglio quando ho un token nuovo.
let failedQueue = [];

// Funzione che processa la coda: se ho un errore rifiuto tutte,
// se ho un token nuovo risolvo le promesse e rilancio le richieste originali.
const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

/* ===========================
   RESPONSE INTERCEPTOR
   ===========================
   Se il server risponde con errore, qui gestisco i 401 dovuti
   a access token scaduto: provo il refresh UNA SOLA VOLTA,
   serializzando la chiamata per evitare richieste duplicate.
*/
axiosInstance.interceptors.response.use(
    // Caso "ok": lascio passare la risposta così com'è.
    (response) => response,

    // Caso "errore": gestisco 401 e metto in coda le richieste se serve.
    async (error) => {
        const status = error.response?.status;
        // Mi salvo la richiesta originale che ha fallito: mi servirà per il retry.
        const originalRequest = error.config || {};

        // Provo il refresh SOLO sui 401 (token scaduto/invalidato).
        // NON lo faccio sui 403: 403 è permesso negato, non token da rinnovare.
        if (status === 401 && !originalRequest._retry) {
            // Segno che questa richiesta sta già facendo retry per evitare loop infiniti.
            originalRequest._retry = true;

            // Se un refresh è già in corso, non ne faccio un altro:
            // accodo questa richiesta e la rilancerò quando avrò il token nuovo.
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            // Quando ho il token nuovo, aggiorno l'Authorization
                            // della richiesta originale e la rilancio.
                            originalRequest.headers = originalRequest.headers || {};
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            resolve(axiosInstance(originalRequest));
                        },
                        reject,
                    });
                });
            }

            // Sono il primo a rilevare il 401: mi prendo l'onere di fare il refresh.
            isRefreshing = true;

            try {
                // Uso axios "grezzo" (non l'istanza) per evitare che gli interceptor
                // di questa istanza interferiscano con la chiamata di refresh.
                const res = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/users/refresh-token`,
                    {},
                    { withCredentials: true } // mando i cookie httpOnly con il refresh token
                );

                // Estraggo il nuovo access token dalla risposta del backend.
                const newAccessToken = res.data.accessToken;

                // Lo salvo in localStorage: il request-interceptor lo applicherà
                // automaticamente alle richieste future.
                localStorage.setItem('accessToken', newAccessToken);

                // Risveglio tutte le richieste in coda fornendo il token nuovo.
                processQueue(null, newAccessToken);

                // Aggiorno anche l'Authorization della richiesta originale che ha triggherato il refresh…
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                // …e la rilancio subito.
                return axiosInstance(originalRequest);
            } catch (err) {
                // Il refresh è fallito: rifiuto tutte le richieste in coda.
                processQueue(err, null);
                // Forzo il logout globale: da qui in poi l'utente dovrà riloggarsi.
                window.dispatchEvent(new Event('forceLogout'));
                return Promise.reject(err);
            } finally {
                // Qualunque sia l'esito, sblocco la possibilità di fare altri refresh in futuro.
                isRefreshing = false;
            }
        }

        // Non è un 401, oppure ho già ritentato questa richiesta: propago l'errore normalmente.
        return Promise.reject(error);
    }
);

export default axiosInstance;