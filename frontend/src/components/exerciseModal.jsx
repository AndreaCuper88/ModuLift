// src/components/ExerciseModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const MUSCLES = [
    "petto",
    "dorso",
    "quadricipiti",
    "femorali",
    "glutei",
    "spalle",
    "bicipiti",
    "tricipiti",
    "polpacci",
    "addominali",
    "obliqui",
];

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onCreated?: (payload) => void
 * - token: string (JWT)
 */
export default function ExerciseModal({ isOpen, onClose, onCreated, token }) {
    const [name, setName] = useState("");
    const [muscle, setMuscle] = useState(MUSCLES[0]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!isOpen) {
            // reset quando chiudi
            setName("");
            setMuscle(MUSCLES[0]);
            setFile(null);
            setPreview(null);
            setSubmitting(false);
            setErr("");
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        setFile(f || null);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErr("");

        // Validazioni base UI
        if (!name.trim()) return setErr("Il nome è obbligatorio.");
        if (!muscle) return setErr("Seleziona un muscolo.");
        if (!file) return setErr("Carica un'immagine (PNG/JPG).");

        setSubmitting(true);


        const payload = {
            name: name.trim(),
            muscle,
            file,                  // File oggetto (per upload futuro)
            filename: file.name,
        };

        onCreated?.(payload);
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Nuovo esercizio</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        aria-label="Chiudi"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {err && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                            {err}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Es. Panca Piana Bilanciere"
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Muscolo</label>
                        <select
                            value={muscle}
                            onChange={(e) => setMuscle(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {MUSCLES.map((m) => (
                                <option key={m} value={m}>
                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Immagine (PNG/JPG)
                        </label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700"
                        />
                        {preview && (
                            <div className="mt-3">
                                <img
                                    src={preview}
                                    alt="Anteprima"
                                    className="w-24 h-24 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {submitting ? "Salvataggio..." : "Crea esercizio"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
