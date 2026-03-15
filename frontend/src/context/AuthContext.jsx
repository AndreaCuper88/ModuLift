//Creo un contesto, sostanzialmente per condividere lo stato di login tra i vari componenti
import {createContext, useState, useEffect} from "react";
import axios from "../api/axiosInstance";

//Creo il contesto
export const AuthContext = createContext(null);

//AuthProvider
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        accessToken: null,
    });
    const [ready, setReady] = useState(false); //Per gestire il caricamento dei dati
    //Sostanzialmente per attendere il caricamento dei dati a seguito di un reload della pagina

    const login = async (email, password) => {
        try {
            const res = await axios.post("users/login", {email, password}, {withCredentials: true});
            const {user, accessToken} = res.data;

            setAuth({user, accessToken});

            localStorage.setItem("accessToken",accessToken);
            localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
            console.error("Errore durante il login: ",e);
            throw e;
        }
        finally {
            setReady(true);
        }
    };

    const logout = async () => {
        try {
            await axios.post("users/logout", {}, {withCredentials: true});
        } catch (e) {
            console.error("Errore durante il logout: ",e);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setAuth({user: null, accessToken: null});
            setReady(true);
        }
    }

    const isTokenExpired = (token) => { //Controllo se il token è scaduto
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);

                if (!isTokenExpired(accessToken)) {
                    // Token valido → tutto normale
                    setAuth({ user, accessToken });
                } else if (!navigator.onLine) {
                    // Token scaduto MA offline → tieni l'utente loggato
                    // I componenti useranno la cache, l'interceptor gestirà il 401
                    setAuth({ user, accessToken });
                } else {
                    // Token scaduto e online → pulisci, dovrà riloggarsi
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                }
            } catch (e) {
                console.error("Errore nel parsing dell'utente:", e);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
            }
        }

        setReady(true);
    }, []);


    //Quindi fornisco un componente con i dati del contesto accessibili ai figli
    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout, ready }}>
            {children}
        </AuthContext.Provider>
    );
}