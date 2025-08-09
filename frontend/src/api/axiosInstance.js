import axios from 'axios';

//Creo un'istanza personalizzata di Axios
const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,//Url di base di tutte le richieste
    headers: {
        'Content-Type': 'application/json', //I dati inviati saranno in formato JSON
    },
    timeout: 10000, //Se il server non risponde entro 10 secondi la richiesta fallisce con errore
});

//Flag per evitare più richieste di refresh in parallelo
let isRefreshing = false;

//coda di richieste fallite da riprovare una volta aggiornato il token
let failedQueue = [];

/**
 * Funzione per la gestione della coda di eventuali richieste fallite
 * Quindi sostanzialmente se ricevo un nuovo token riprovo tutte le richieste in coda
 * Altrimenti le rigetto tutte
 */
const processQueue = (error, token = null) => {
    failedQueue.forEach((item) => {
        if (error) {
            item.reject(error); //Rigetto le richieste con errori
        } else {
            item.resolve(token); //Risolvo le richieste con il nuovo accessToken, vedi riga 49
        }
    });
    failedQueue = []; //Quindi svuoto la coda
};

//Axios interceptor, eseguito per ogni risposta ricevuta
//Sintassi: axiosInstance.interceptors.response.use(successCallback, errorCallback)
axiosInstance.interceptors.response.use(
    response => response, //Se la risposta è OK, non faccio nulla: axios considera okay tutte le risposte comprese tra 200 e 299

    async error => {
        const originalRequest = error.config; //Mi salvo la richiesta originale, contenuta in error.config

        //Se ricevo un 401(Unauthorized) o 403 (Forbidden) e non ho già provato, riprovo la richiesta
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true; //Setto su true per evitare loop infiniti di retry, ._retry è una proprietà personalizzata che aggiungo manualmente all'oggetto config della richiesta

            if (isRefreshing) { //Se un refresh è già in corso
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            //Quando ricevo il nuovo token aggiorno l'Authorization header della richiesta originale
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            resolve(axiosInstance(originalRequest));
                        },
                        reject: (error) => {
                            reject(error); //In caso di errore rigetto
                        }
                    });
                });
            }
            // Altrimenti, sono il primo che prova il refresh
            isRefreshing = true;

            try {
                // Faccio una richiesta al backend per ottenere un nuovo access token
                const res = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/users/refresh-token`,
                    {},
                    { withCredentials: true } // Invio anche i cookie
                );

                // Prendo il nuovo access token dalla risposta
                const newAccessToken = res.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                // Aggiorno l’header Authorization di default per tutte le nuove richieste
                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

                // Risolvo tutte le richieste in coda con il nuovo token
                processQueue(null, newAccessToken);

                // Aggiungo il nuovo token alla richiesta originale e la rilancio
                //Richiesta originale: richiesta che ha fatto scattare il refresh del token
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                return axiosInstance(originalRequest);

            } catch (err) {
                // Se il refresh fallisce, rigetto tutte le richieste in coda
                processQueue(err, null);
                // Fare logout automatico qui
                window.dispatchEvent(new Event('forceLogout'));
                /**
                 * Praticamente window, è un oggetto globale del browser
                 * La funzione .dispatchEvent mi permette di lanciare, "emanare", un evento su un oggetto che in questo caso è condiviso
                 * Quindi sostanzialmente lancio l'evento forceLogout per poi ascoltarlo e fare il logout
                 * Tutto ciò poichè gli hook di React, useState, useEffect ecc.. funzionano solo dentro componenti React o altri hook
                 */

                return Promise.reject(err);
            } finally {
                // Resetto il flag, pronto per altri refresh futuri
                isRefreshing = false;
            }
        }

        // Se non è un 401/403, o ho già ritentato → errore normale
        return Promise.reject(error);
    }
);

export default axiosInstance;