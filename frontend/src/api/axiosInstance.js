import axios from 'axios';

//Creo un'istanza personalizzata di Axios
const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,//Url di base di tutte le richieste
    headers: {
        'Content-Type': 'application/json', //I dati inviati saranno in formato JSON
    },
    timeout: 10000, //Se il server non risponde entro 10 secondi la richiesta fallisce con errore
})

export default axiosInstance;