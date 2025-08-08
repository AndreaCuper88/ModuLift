import { useState } from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function GestioneClienti() {
    const navigate = useNavigate();

    const clientiFinti = [
        { id: 1, nome: "Mario Rossi", email: "mario@esempio.com", dataRegistrazione: "2025-08-01" },
        { id: 2, nome: "Lucia Bianchi", email: "lucia@esempio.com", dataRegistrazione: "2025-07-25" },
        { id: 3, nome: "Alessio Verdi", email: "alessio@esempio.com", dataRegistrazione: "2025-08-05" }
    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [clienti, setClienti] = useState(clientiFinti);

    const handleElimina = (id) => {
        const conferma = window.confirm("Sei sicuro di voler eliminare questo cliente?");
        if (conferma) {
            setClienti(prev => prev.filter(cliente => cliente.id !== id));
        }
    };

    const clientiFiltrati = clienti.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-black">Gestione Clienti</h1>

            {/* Barra di ricerca */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="🔍 Cerca per nome o email..."
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista clienti */}
            <div className="space-y-6">
                {clientiFiltrati.length > 0 ? (
                    clientiFiltrati.map(cliente => (
                        <div
                            key={cliente.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-200"
                        >
                            <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                    <FaUser className="text-2xl text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{cliente.nome}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{cliente.email}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registrato il {cliente.dataRegistrazione}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap justify-end">
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    onClick={() => navigate(`/admin/scheda/${cliente.id}`)}
                                >
                                    Scheda
                                </button>
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    onClick={() => navigate(`/admin/misure/${cliente.id}`)}
                                >
                                    Misure
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    onClick={() => navigate(`/admin/piano/${cliente.id}`)}
                                >
                                    Piano alimentare
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                                    onClick={() => handleElimina(cliente.id)}
                                >
                                    <FaTrash className="text-sm" />
                                    Elimina
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">Nessun cliente trovato.</p>
                )}
            </div>
        </div>
    );
}
