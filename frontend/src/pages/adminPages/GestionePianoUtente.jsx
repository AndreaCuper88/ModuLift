import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, RefreshCw, RotateCcw } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import UserCard from "../../components/UserCard";
import {useParams} from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {savePianoAlimentare, getLatestPiano} from "../../api/adminApi/pianoAlimentareApi";

// ------------------------------------------------------
// ModuLift – Editor Piano Alimentare
// ------------------------------------------------------

export default function MealPlanEditor({setAlert}) {
    const {id} = useParams();
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;

    const [aggiornaUltimo, setAggiornaUltimo] = useState(false); //Gestione per capire se salvare nuovo piano o aggiornare l'ultimo

    const getDefaultPlan = () => ({ //Valori di default
        title: "Piano alimentare 1",
        meals: [
            {
                id: uuidv4(),
                name: "Colazione",
                notes:
                    "",
            },
            {
                id: uuidv4(),
                name: "Pranzo",
                notes:
                    "",
            },
            {
                id: uuidv4(),
                name: "Cena",
                notes:
                    "",
            },
        ],
        comments:
            "",
        recommendations:
            "",
    });
    const [plan, setPlan] = useState(() => getDefaultPlan());
    const resetToDefault = () => setPlan(getDefaultPlan());

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(false);

    async function loadPlan() {
        try {
            setLoadingPlan(true);

            const data = await getLatestPiano(auth.accessToken, id);

            if (!data) {
                setAlert({ message: "Nessun piano trovato. Puoi crearne uno nuovo.", type: "success" });
                resetToDefault();
                return;
            }

            setPlan(data);
        } catch (e) {
            setAlert({ message: e?.message || "Errore caricamento piano", type: "danger" });
            console.error(e);
        } finally {
            setLoadingPlan(false);
        }
    }

    async function savePlan() {
        try {
            setSaving(true);
            //console.log(aggiornaUltimo);

            const res = await savePianoAlimentare(auth.accessToken, {
                userId: id,
                ...plan,
                mode: aggiornaUltimo ? "update-latest" : "create-new",
            });

            setAlert({ message: res.message || "Piano salvato con successo", type: "success" });
        } catch (err) {
            setAlert({
                message: err?.message || "Errore salvataggio piano",
                type: "danger",
            });
            console.error("Errore salvataggio piano:", err.message || err);
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        loadPlan();
    }, [id, API_BASE]);

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseInput = "w-full rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-500 px-3 py-2 outline-none ring-0";
    const baseTextArea = "w-full min-h-[120px] rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-500 px-3 py-2 outline-none";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const ghostIconBtn = "inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition";

    const addMeal = () => setPlan((p) => ({ ...p, meals: [...p.meals, { id: uuidv4(), name: `Pasto ${p.meals.length + 1}`, notes: "Note del pasto..." }] }));
    const removeMeal = (id) => setPlan((p) => ({ ...p, meals: p.meals.filter((m) => m.id !== id) }));

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <UserCard idUtente={id} />
                </div>

                {loadingPlan ? (
                    <div className="w-full h-full min-h-24 flex items-center justify-center">
                        <div role="status">
                            <svg aria-hidden="true"
                                 className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                 viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                      fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                      fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-2xl font-semibold md:text-3xl">Editor Piano Alimentare</h1>
                            <div className="flex items-center gap-2">
                                <button onClick={resetToDefault} className={baseBtn} disabled={saving || loading}>
                                    <RotateCcw className="h-4 w-4"/> Predefinito
                                </button>
                                <button onClick={loadPlan} className={baseBtn} disabled={loading}>
                                    <RefreshCw className="h-4 w-4"/> {loading ? "Carico..." : "Ricarica"}
                                </button>
                                <button onClick={savePlan} className={baseBtn} disabled={saving}>
                                    <Save className="h-4 w-4"/> {saving ? "Salvo..." : "Salva"}
                                </button>
                                {/* Toggle aggiornaUltimo */}
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={aggiornaUltimo}
                                        onChange={(e) => setAggiornaUltimo(e.target.checked)}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                                  peer-checked:after:translate-x-full peer-checked:after:border-white
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                  peer-checked:bg-blue-600">
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                    {aggiornaUltimo ? "Aggiorna ultimo" : "Crea nuovo"}
                                </span>
                                </label>
                            </div>
                        </div>

                        <div className={`${baseCard} mb-6`}>
                    <div className="border-b border-gray-300 px-4 py-3">
                        <h2 className="text-lg font-semibold">Titolo</h2>
                    </div>
                    <div className="p-4">
                        <input
                            className={baseInput}
                            value={plan.title}
                            onChange={(e) => setPlan((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Es. Piano Settimana 33"
                        />
                    </div>
                </div>

                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Pasti</h2>
                    <button onClick={addMeal} className={baseBtn}>
                        <Plus className="h-4 w-4" /> Aggiungi pasto
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {plan.meals.map((meal, idx) => (
                        <div key={meal.id} className={baseCard}>
                            <div className="flex items-center gap-3 border-b border-gray-300 px-4 py-3">
                                <input
                                    className={baseInput}
                                    value={meal.name}
                                    onChange={(e) =>
                                        setPlan((p) => ({
                                            ...p,
                                            meals: p.meals.map((m) => (m.id === meal.id ? { ...m, name: e.target.value } : m)),
                                        }))
                                    }
                                    placeholder={`Pasto ${idx + 1}`}
                                />
                                <button className={ghostIconBtn} onClick={() => removeMeal(meal.id)}>
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-4">
                    <textarea
                        className={baseTextArea}
                        value={meal.notes}
                        onChange={(e) =>
                            setPlan((p) => ({
                                ...p,
                                meals: p.meals.map((m) => (m.id === meal.id ? { ...m, notes: e.target.value } : m)),
                            }))
                        }
                        placeholder="Dettagli del pasto (ingredienti, quantità, orari, note)"
                    />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className={baseCard}>
                        <div className="border-b border-gray-300 px-4 py-3">
                            <h3 className="text-lg font-semibold">Commenti</h3>
                        </div>
                        <div className="p-4">
                  <textarea
                      className="w-full min-h-[140px] rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-500 px-3 py-2 outline-none"
                      value={plan.comments}
                      onChange={(e) => setPlan((p) => ({ ...p, comments: e.target.value }))}
                      placeholder="Annotazioni generali..."
                  />
                        </div>
                    </div>

                    <div className={baseCard}>
                        <div className="border-b border-gray-300 px-4 py-3">
                            <h3 className="text-lg font-semibold">Raccomandazioni</h3>
                        </div>
                        <div className="p-4">
                              <textarea
                                  className="w-full min-h-[140px] rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-500 px-3 py-2 outline-none"
                                  value={plan.recommendations}
                                  onChange={(e) => setPlan((p) => ({ ...p, recommendations: e.target.value }))}
                                  placeholder="Consigli pratici..."
                              />
                        </div>
                    </div>
                </div>
            </>
                )}
            </div>
        </div>
    );
}