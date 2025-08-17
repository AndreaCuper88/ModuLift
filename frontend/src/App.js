import {BrowserRouter} from 'react-router-dom';
import './App.css';
import {useEffect, useState} from "react";

//Import componenti
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Alert from './components/SimpleAlert';

//Import routers
import AdminRoutes from "./routes/AdminRoutes";
import ClienteRoutes from "./routes/ClientiRoutes";
import PublicRoutes from "./routes/PublicRoutes";

//Import custom hooks
import useAuth from "../src/hooks/useAuth";

export default function App() {
    const { logout } = useAuth();
    //Gestione alert globale
    const [alert, setAlert] = useState({message: '', type: ''});

    useEffect(() => {   //Lo chiudo automaticamente dopo 5 secondi
        if (alert.message) {
            const timer = setTimeout(() => {
                setAlert({message: '', type: ''});
            }, 5000);
            return () => clearTimeout(timer);
        }
    },[alert]);
    //Fine gestione alert globale

    useEffect(() => {
        const handleLogout = () => {
            logout();
        };

        window.addEventListener("forceLogout", handleLogout); //Ascolto l'evento forceLogout

        return () => {
            window.removeEventListener("forceLogout", handleLogout);
        };
    }, []);

    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen"> {/* min-h-screen: forzo il contenuto ad occupare l'intera pagina */}
                {alert.message && ( //Mostro l'alert se presente
                    <Alert
                        message={alert.message}
                        type={alert.type}
                        onClose={() => setAlert({ message: '', type: '' })}
                    />
                )}
                <Navbar setAlert={setAlert} />
                <main className="flex-grow"> {/* forzo il main crescere e quindi riempire lo spazio tra navbar e footer */}
                    <PublicRoutes />
                    <AdminRoutes setAlert={setAlert} />
                    <ClienteRoutes />
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    )
}