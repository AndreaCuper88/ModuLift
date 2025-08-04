import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';

//Import componenti
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

//Import pagine
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from "./pages/Register.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen"> {/* min-h-screen: forzo il contenuto ad occupare l'intera pagina */}
                <Navbar />
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