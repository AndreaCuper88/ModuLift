import React,{useState} from "react";
import { Link } from 'react-router-dom';
import logo from '../assets/ModuLift_Logo.png';
import LoginDropdown from '../components/LoginDropdown';
import useAuth from "../hooks/useAuth";
import UserMenu from "../components/UserMenu";


export default function Navbar() {
    const { auth } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

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
                                <a
                                    href="#"
                                    className="rounded-md px-3 py-2 text-base font-medium text-black hover:text-gray-700"
                                    aria-current="page"
                                >
                                    Dashboard
                                </a>

                                <a
                                    href="#"
                                    className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    Team
                                </a>
                                <a
                                    href="#"
                                    className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    Projects
                                </a>
                                <a
                                    href="#"
                                    className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    Calendar
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
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
                            {auth.user ? <UserMenu /> : <LoginDropdown />}
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