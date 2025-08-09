import {useEffect, useState} from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import {getClienti, deleteCliente, disableCliente} from "../../api/clientiApi";

import ClienteActionModal from "../../components/ClienteActionModal";


export default function GestioneClienti() {
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [searchTerm, setSearchTerm] = useState("");//Barra di ricerca
    const [clienti, setClienti] = useState([]);//Array di clienti da caricare

    //Gestione modal eliminazione clienti
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);

    //Loading
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        const fetchClienti = async () => {
            if (!auth?.accessToken) return;

            try {
                setLoading(true);
                const data = await getClienti(auth.accessToken);
                //console.log(data); per debug
                setClienti(data);
            } catch (err) {
                console.error("Errore nel caricamento dei clienti:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClienti();
    }, [auth]);

    //Apertura e chiusura del modal, apro il modal e punto ad un cliente
    const openModal = (cliente) => {
        setSelectedCliente(cliente);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setSelectedCliente(null);
        setIsModalOpen(false);
    };

    const handleDeactivate = async () => {
        if (!selectedCliente) return;

        try {
            setLoadingAction(true);
            await disableCliente(selectedCliente._id, auth.accessToken);
            setClienti(prev => prev.filter(c => c._id !== selectedCliente._id));
            //.filter crea un nuovo array mantenendo solo gli elementi che rispettano la condizione
            closeModal();
        } catch (e) {
            console.error("Errore disattivazione cliente: ", e);
        } finally {
            setLoadingAction(false);
        }
    }

    const handleDelete = async () => {
        if (!selectedCliente) return;
        try {
            setLoadingAction(true);
            await deleteCliente(selectedCliente._id, auth.accessToken);

            setClienti(prev => prev.filter(c => c._id !== selectedCliente._id));
            //.filter crea un nuovo array mantenendo solo gli elementi che rispettano la condizione
            closeModal();
        } catch (e) {
            console.error("Errore eliminazione:", e);
        } finally {
            setLoadingAction(false);
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
            <div className="mb-8 sticky top-4 bg-transparent z-10">
                <input
                    type="text"
                    placeholder="🔍 Cerca per nome o email..."
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>



            {/* Lista clienti */}
            <div className="space-y-6">
                {clientiFiltrati.length > 0 ? (
                    clientiFiltrati.map(cliente => (
                        <div
                            key={cliente._id}
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
                                    onClick={() => navigate(`/admin/scheda/${cliente._id}`)}
                                >
                                    Scheda
                                </button>
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    onClick={() => navigate(`/admin/misure/${cliente._id}`)}
                                >
                                    Misure
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    onClick={() => navigate(`/admin/piano/${cliente._id}`)}
                                >
                                    Piano alimentare
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-60"
                                    onClick={() => openModal(cliente)}
                                    disabled={loadingAction && selectedCliente?._id === cliente._id}
                                >
                                    <FaTrash className="text-sm" />
                                    {(loadingAction && selectedCliente?._id === cliente._id) ? "In corso…" : "Elimina"}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">Nessun cliente trovato.</p>
                )}
            </div>
            {/* Modale azioni */}
            <ClienteActionModal
                open={isModalOpen}
                onClose={closeModal}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
                cliente={selectedCliente}
                loading={loadingAction}
            />
        </div>
    );
}
