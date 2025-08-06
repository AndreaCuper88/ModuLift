import React from 'react';

export default function Alert({ message, onClose, type = "danger" }) {
    const typeClasses = {
        success: {
            container: "text-green-800 border-green-300 bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800",
            icon: (
                <svg className="shrink-0 w-4 h-4 me-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 0 0-1.414 0L8 12.586 4.707 9.293a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l8-8a1 1 0 0 0 0-1.414z" />
                </svg>
            )
        },
        danger: {
            container: "text-red-800 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800",
            icon: (
                <svg className="shrink-0 w-4 h-4 me-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
            )
        }
    };

    const alertType = typeClasses[type] || typeClasses["danger"];

    return (
        <div
            className={`flex items-center p-4 text-sm border rounded-lg fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-xl w-[90%] shadow-lg ${alertType.container}`}
            role="alert"
        >
            {alertType.icon}
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