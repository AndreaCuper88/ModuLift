import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-light text-black border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                {/* Testo */}
                <p className="text-sm text-center md:text-left">
                    &copy; {new Date().getFullYear()} ModuLift. Tutti i diritti riservati.
                </p>

                {/* Icone social */}
                <div className="flex space-x-4">
                    <a href="#" aria-label="Instagram" className="hover:opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5C22 19.55 19.55 22 16.25 22h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5C5.4 3.5 3.5 5.4 3.5 7.75v8.5C3.5 18.6 5.4 20.5 7.75 20.5h8.5c2.35 0 4.25-1.9 4.25-4.25v-8.5C20.5 5.4 18.6 3.5 16.25 3.5h-8.5zM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zm5.5-.875a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z"/>
                        </svg>
                    </a>
                    <a href="#" aria-label="Facebook" className="hover:opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.5h2.3l-.4 2.9h-1.9v7A10 10 0 0 0 22 12z"/>
                        </svg>
                    </a>
                    <a href="#" aria-label="Twitter" className="hover:opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37c-.82.49-1.7.84-2.65 1.03a4.28 4.28 0 0 0-7.29 3.9 12.13 12.13 0 0 1-8.8-4.46 4.28 4.28 0 0 0 1.33 5.7 4.27 4.27 0 0 1-1.94-.54v.06a4.28 4.28 0 0 0 3.43 4.19 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.1 12.1 0 0 0 6.56 1.92c7.87 0 12.17-6.52 12.17-12.17l-.01-.55A8.66 8.66 0 0 0 22.46 6z"/>
                        </svg>
                    </a>
                </div>

                {/* Link footer */}
                <div className="flex space-x-4 text-sm">
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Contatti</a>
                    <a href="#" className="hover:underline">Credits</a>
                </div>
            </div>
        </footer>
    );
}