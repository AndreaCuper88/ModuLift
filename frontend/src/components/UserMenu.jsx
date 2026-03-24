import { useState, useRef, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function UserMenu({ setAlert, avatarPath }) {
    const { auth, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setAlert({ message: "Logout effettuato con successo!!!", type: "success" });
        setOpen(false);
        navigate("/");
    };

    const initials = auth.user?.username
        ? auth.user.username.charAt(0).toUpperCase()
        : "U";

    return (
        <div className="relative" ref={menuRef}>

            {/* Avatar */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-white text-sm font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition overflow-hidden"
            >
                {avatarPath ? (
                    <img
                        src={`${process.env.REACT_APP_API_BASE_URL}/uploads/avatars/${avatarPath}`}
                        alt="avatar"
                        className="w-full h-full object-cover rounded-full"
                    />
                ) : (
                    initials
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">

                        {/* Header utente */}
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-800 truncate">{auth.user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{auth.user?.email}</p>
                        </div>

                        {/* Profilo */}
                        <Link
                            to={`/profilo/${auth.user?.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            Profilo
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                            Logout
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}