import React, {useCallback, useEffect, useState} from "react";
import { Link } from 'react-router-dom';
import logo from '../assets/ModuLift_Logo.png';
import LoginDropdown from '../components/LoginDropdown';
import useAuth from "../hooks/useAuth";
import UserMenu from "../components/UserMenu";
import {getMyLatestPiano} from "../api/clienteApi/utilsApi";
import {createSearchParams} from "react-router-dom";


export default function Navbar({ setAlert }) {
    const { auth } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    // Inizializzo da localStorage: così se ricarico offline ho già il planId
    const storedPlanId = localStorage.getItem("latestPlanId");

    const [plan, setPlan] = useState(
        storedPlanId ? { planId: storedPlanId } : null
    );

    const [loadedPlan, setLoadedPlan] = useState(!!storedPlanId);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);


    const loadMyLatestPlan = useCallback(async () => {
        if (auth.user?.ruolo !== "cliente") return;
        if (!auth.accessToken) return;

        const cached = localStorage.getItem("latestPlanId");
        if (cached) {
            setPlan({ planId: cached });
            setLoadedPlan(true);
        }

        if (!navigator.onLine) {
            console.log("[Navbar] Offline → uso cache");
            return;
        }

        try {
            const data = await getMyLatestPiano(auth.accessToken);
            const latestId = data?._id ?? data?.id ?? "";

            if (latestId) {
                setPlan({ planId: latestId });
                setLoadedPlan(true);
                localStorage.setItem("latestPlanId", latestId);
            } else {
                setPlan(null);
                setLoadedPlan(false);
                localStorage.removeItem("latestPlanId");
            }
        } catch (e) {
            // Errore di rete o token scaduto → usa la cache silenziosamente
            if (!cached) {
                if (e.status === 404) {
                    setPlan(null);
                    setLoadedPlan(false);
                } else {
                    setAlert({
                        message: e.message || "Errore caricamento piano",
                        type: "danger"
                    });
                }
            }
            // Se c'era la cache, non fare nulla — il piano rimane visibile
        }
    }, [auth.accessToken, auth.user]);

    useEffect(() => {
        loadMyLatestPlan();
    }, [loadMyLatestPlan]);

    useEffect(() => {
        console.log("Plan aggiornato:", plan?.planId);
    }, [plan]);


    return (
        <nav className="bg-light">
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="absolute -inset-0.5"></span>
                            <span className="sr-only">Apri il menu</span>
                            {isOpen ? (
                                // Icona X
                                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                // Icona Hamburger
                                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <Link to="/">
                            <div className="flex shrink-0 items-center">
                                <img
                                    className="h-10 w-auto"
                                    src={logo}
                                    alt="Modu Lift Logo"
                                />
                            </div>
                        </Link>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                <Link
                                    to="/dashboard"
                                    className="rounded-md px-3 py-2 text-base font-medium text-black hover:text-gray-700"
                                >
                                    Dashboard
                                </Link>

                                {auth.user?.ruolo === 'admin' && (
                                    <Link
                                        to="/admin/clienti"
                                        className="rounded-md px-3 py-2 text-base font-medium text-black hover:text-gray-700"
                                    >
                                        Clienti
                                    </Link>
                                )}
                                {auth.user?.ruolo === 'cliente' && (
                                    loadedPlan ? (
                                        <Link
                                            to={{
                                                pathname: "/cliente/allenamento",
                                                search: createSearchParams({ planId: plan.planId }).toString(),
                                            }}
                                            className="rounded-md px-3 py-2 text-base font-medium text-black hover:text-gray-700"
                                        >
                                            Allenamento
                                        </Link>
                                    ) : (
                                        <span className="relative group rounded-md px-3 py-2 text-base font-medium text-gray-400 cursor-not-allowed">
                                            Allenamento

                                            {/* TOOLTIP */}
                                            <span className="
                                                absolute left-1/2 -translate-x-1/2 top-[110%]
                                                bg-gray-800 text-white text-xs px-2 py-1 rounded
                                                opacity-0 group-hover:opacity-100
                                                transition-opacity duration-200
                                                pointer-events-none
                                                whitespace-nowrap
                                                z-50
                                            ">
                                                Nessun piano disponibile al momento
                                            </span>
                                        </span>

                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <span
                            className={`mr-3 text-sm font-semibold ${
                                isOnline ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {isOnline ? "Online" : "Offline"}
                        </span>
                        <button
                            type="button"
                            className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                            <span className="absolute -inset-1.5"></span>
                            <span className="sr-only">View notifications</span>
                            <svg
                                className="size-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                />
                            </svg>
                        </button>

                        <div className="relative ml-3">
                            {auth.user ? <UserMenu setAlert={setAlert} /> : <LoginDropdown setAlert={setAlert} />}
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden" id="mobile-menu">
                    <div className="sm:hidden bg-light px-4 pt-4 pb-6" id="mobile-menu">
                        <div className="space-y-3">
                            <a
                                href="#"
                                className="block rounded-md text-base font-semibold text-black hover:bg-gray-200 px-3 py-2"
                                aria-current="page"
                            >
                                Dashboard
                            </a>
                            <a
                                href="#"
                                className="block rounded-md text-base font-medium text-black hover:bg-gray-200 px-3 py-2"
                            >
                                Team
                            </a>
                            <a
                                href="#"
                                className="block rounded-md text-base font-medium text-black hover:bg-gray-200 px-3 py-2"
                            >
                                Projects
                            </a>
                            <a
                                href="#"
                                className="block rounded-md text-base font-medium text-black hover:bg-gray-200 px-3 py-2"
                            >
                                Calendar
                            </a>
                        </div>
                    </div>
                </div>
            )}


        </nav>


)
}