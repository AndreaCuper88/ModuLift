import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';

//Import componenti
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

//Import pagine
import HomePage from "./pages/HomePage.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}