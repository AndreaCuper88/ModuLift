import React from 'react';

export default function Alert({ message, onClose }) {
    return (
        <div
            className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-xl w-[90%] shadow-lg"
            role="alert"
        >
            <svg
                className="shrink-0 w-4 h-4 me-3"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="flex-1">
                <span className="font-medium">{message}</span>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-sm font-semibold underline hover:text-opacity-70"
                >
                    Chiudi
                </button>
            )}
        </div>
    );
}
