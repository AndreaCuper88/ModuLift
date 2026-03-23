import React, {useEffect, useState} from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import {getClienti, deleteCliente, disableCliente} from "../../api/adminApi/clientiApi";

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
                //console.log(data);
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
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-6xl px-4 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold md:text-3xl">Gestione Clienti</h1>
                    <p className="text-sm text-gray-500 mt-1">Visualizza e gestisci i clienti registrati</p>
                </div>

                {/* Barra di ricerca */}
                <div className="mb-6 sticky top-4 z-10">
                    <input
                        type="text"
                        placeholder="🔍 Cerca per nome o email..."
                        className="w-full px-5 py-3 rounded-2xl border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Lista clienti */}
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl border border-gray-300 bg-white p-6 animate-pulse">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 rounded bg-gray-200" />
                                        <div className="h-3 w-48 rounded bg-gray-200" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : clientiFiltrati.length > 0 ? (
                        clientiFiltrati.map(cliente => (
                            <div
                                key={cliente._id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-gray-300 bg-white p-5 hover:shadow-md transition duration-200"
                            >
                                <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                    {cliente.avatarPath ? (
                                        <img
                                            src={`${process.env.REACT_APP_API_BASE_URL}/uploads/avatars/${cliente.avatarPath}`}
                                            alt="User"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="bg-blue-50 p-3 rounded-full">
                                            <FaUser className="text-xl text-blue-500" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">{cliente.nome}</h2>
                                        <p className="text-sm text-gray-500">{cliente.email}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Registrato il {new Date(cliente.dataRegistrazione).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap justify-end">
                                    <button
                                        className="px-4 py-2 rounded-2xl text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                        onClick={() => navigate(`/admin/scheda/${cliente._id}`)}
                                    >
                                        Scheda
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-2xl text-sm font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                                        onClick={() => navigate(`/admin/misure/${cliente._id}`)}
                                    >
                                        Misure
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-2xl text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition"
                                        onClick={() => navigate(`/admin/piano/${cliente._id}`)}
                                    >
                                        Piano alimentare
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-2xl text-sm font-medium bg-rose-50 text-rose-500 hover:bg-rose-100 transition flex items-center gap-1 disabled:opacity-60"
                                        onClick={() => openModal(cliente)}
                                        disabled={loadingAction && selectedCliente?._id === cliente._id}
                                    >
                                        <FaTrash className="text-xs" />
                                        {(loadingAction && selectedCliente?._id === cliente._id) ? "In corso…" : "Elimina"}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-12">Nessun cliente trovato.</p>
                    )}
                </div>

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