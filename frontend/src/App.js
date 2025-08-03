import './App.css';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
    return (
        <>
            <Navbar />
            <h1 className="text-3xl font-bold underline">
                Hello world!
            </h1>
            <Footer />
        </>
    )
}