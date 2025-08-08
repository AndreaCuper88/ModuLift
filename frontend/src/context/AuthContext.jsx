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

    const login = async (email, password) => {
        try {
            const res = await axios.post("users/login", {email, password}, {withCredentials: true});
            const {user, accessToken} = res.data;

            setAuth({user, accessToken});

            localStorage.setItem("accessToken",accessToken);
            localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
            console.error("Errore durante il login: ",e);
        }
    };

    const logout = async () => {
        try {
            await axios.post("users/logout", {}, {withCredentials: true});
        } catch (e) {
            console.error("Errore durante il logout: ",e);
        }

        localStorage.removeItem("accessToken");
        setAuth({user: null, accessToken: null});
    }

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setAuth({ user, accessToken });
            } catch (e) {
                console.error("Errore nel parsing dell'utente:", e);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
            }
        }
    }, []);


    //Quindi fornisco un componente con i dati del contesto accessibili ai figli
    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}