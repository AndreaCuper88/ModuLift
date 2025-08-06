import {Link} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import useAuth from "../hooks/useAuth";

import userLogo from '../assets/User_Logo.png';


export default function LoginDropdown({setAlert}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    },[]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(email, password);
            setOpen(false);
            setEmail("");
            setPassword("");
            setAlert({message: "Login effettuato con successo!!!", type: "success"});
        } catch (error) {
            console.log(error);
            setError("Credenziali non valide o errore di rete.");
        }
    }
    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white"
            >
                <img src={userLogo} alt="user logo" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-50 p-4">
                    <h3 className="text-lg font-semibold mb-2">Accedi</h3>
                    <form onSubmit={handleLogin} className="space-y-3">
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full border p-2 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border p-2 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-black text-white p-2 rounded hover:opacity-90"
                        >
                            Accedi
                        </button>
                    </form>

                    <div className="text-sm text-center mt-4">
                        <span className="text-gray-600">Non sei registrato? </span>
                        <Link to="/register" className="text-blue-600 hover:underline" onClick={() => setOpen(false)}>
                            Registrati ora!
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}