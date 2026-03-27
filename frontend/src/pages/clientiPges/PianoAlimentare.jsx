import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import UserCard from "../../components/UserCard";
import { getLatestPiano } from "../../api/clienteApi/pianoalimentareApi";
import { downloadPianoAlimentarePdf } from "../../api/clienteApi/pdfApi";

// ------------------------------------------------------
// ModuLift – Visualizzazione Piano Alimentare
// ------------------------------------------------------

export default function PianoAlimentare({ setAlert }) {
    const { auth } = useAuth();
    const id = auth?.user?.id;


    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    async function loadPlan() {
        try {
            setLoading(true);
            const data = await getLatestPiano(auth.accessToken);
            //console.log(data);
            if (!data) {
                setAlert({
                    message: "Nessun piano disponibile",
                    type: "danger",
                });
                return;
            }

            setPlan(data);
        } catch (e) {
            setAlert({
                message: e?.message || "Errore caricamento piano",
                type: "danger",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPlan();
    }, [id]);

    const [loadingPdf, setLoadingPdf] = useState(false);

    async function handleDownloadPdf() {
        try {
            setLoadingPdf(true);
            const blob = await downloadPianoAlimentarePdf(auth.accessToken, plan);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "piano-alimentare.pdf";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setAlert({ message: "Errore generazione PDF", type: "danger" });
        } finally {
            setLoadingPdf(false);
        }
    }

    const baseCard =
        "rounded-2xl border border-gray-300 bg-white text-gray-900 shadow-sm";

    const baseBtn =
        "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition";

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">

                {/* USER */}
                <div className="mb-6 flex items-center gap-4">
                    <UserCard idUtente={id} />
                </div>

                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-semibold">
                        Piano Alimentare
                    </h1>

                    <div className="flex items-center gap-2">
                        {plan && (
                            <button
                                onClick={handleDownloadPdf}
                                disabled={loadingPdf}
                                className={baseBtn}
                            >
                                🖨️ {loadingPdf ? "Generando..." : "Scarica PDF"}
                            </button>
                        )}

                        <button onClick={loadPlan} className={baseBtn}>
                            <RefreshCw className="h-4 w-4" />
                            {loading ? "Aggiorno..." : "Aggiorna"}
                        </button>

                    </div>
                </div>

                {loading || !plan ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* TITOLO */}
                        <div className={`${baseCard} mb-6`}>
                            <div className="border-b border-gray-300 px-4 py-3">
                                <h2 className="text-lg font-semibold">
                                    {plan.title}
                                </h2>
                            </div>
                        </div>

                        {/* PASTI */}
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold mb-3">
                                Pasti
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.meals.map((meal, idx) => (
                                    <div key={meal.id} className={baseCard}>
                                        <div className="border-b border-gray-300 px-4 py-3">
                                            <h3 className="font-semibold">
                                                {meal.name || `Pasto ${idx + 1}`}
                                            </h3>
                                        </div>

                                        <div className="p-4">
                                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                                {meal.notes || "Nessuna nota"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* COMMENTI + RACCOMANDAZIONI */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className={baseCard}>
                                <div className="border-b border-gray-300 px-4 py-3">
                                    <h3 className="text-lg font-semibold">
                                        Commenti
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {plan.comments || "Nessun commento"}
                                    </p>
                                </div>
                            </div>

                            <div className={baseCard}>
                                <div className="border-b border-gray-300 px-4 py-3">
                                    <h3 className="text-lg font-semibold">
                                        Raccomandazioni
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {plan.recommendations || "Nessuna raccomandazione"}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}