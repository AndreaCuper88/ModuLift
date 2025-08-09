import { useEffect, useRef } from "react";

export default function ClienteActionModal({
                                               open,
                                               onClose,
                                               onDeactivate,
                                               onDelete,
                                               cliente,
                                               loading
                                           }) {
    const closeBtnRef = useRef(null);

    useEffect(() => {
        if (open && closeBtnRef.current) closeBtnRef.current.focus();
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cliente-action-title"
            >
                <div className="mb-4">
                    <h2 id="cliente-action-title" className="text-xl font-semibold">Gestisci utente</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {cliente
                            ? `Cosa vuoi fare con ${cliente.nome} ${cliente.cognome}?`
                            : "Seleziona l’azione da eseguire."}
                    </p>
                </div>

                <div className="grid gap-3">
                    <button
                        onClick={onDeactivate}
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-60"
                    >
                        <div className="font-medium">Disattiva utente</div>
                        <div className="text-sm text-gray-600">
                            Resta in memoria <strong>senza perdita di dati</strong>.
                        </div>
                    </button>

                    <button
                        onClick={onDelete}
                        disabled={loading}
                        className="w-full rounded-xl border border-red-300 px-4 py-3 text-left hover:bg-red-50 disabled:opacity-60"
                    >
                        <div className="font-medium text-red-700">Elimina definitivamente</div>
                        <div className="text-sm text-red-600">Operazione irreversibile.</div>
                    </button>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        ref={closeBtnRef}
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-60"
                    >
                        Annulla
                    </button>
                </div>
            </div>
        </div>
    );
}
