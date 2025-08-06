import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';

//Import componenti
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Alert from './components/SimpleAlert';

//Import pagine
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from "./pages/Register.jsx";
import {useEffect, useState} from "react";

export default function App() {
    const [alert, setAlert] = useState({message: '', type: ''});

    useEffect(() => {   //Lo chiudo automaticamente dopo 5 secondi
        if (alert.message) {
            const timer = setTimeout(() => {
                setAlert({message: '', type: ''});
            }, 5000);
            return () => clearTimeout(timer);
        }
    },[alert]);

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
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    )
}