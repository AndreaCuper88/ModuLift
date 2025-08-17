import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Save, RefreshCw, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import useAuth from "../../hooks/useAuth";

// ------------------------------------------------------
// ModuLift – Allenamento
// ------------------------------------------------------

export default function WorkoutPage() {
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [params] = useSearchParams();
    const planId = params.get("planId"); //Id del piano workout da caricare
    console.log(planId);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [plan, setPlan] = useState({
        id: planId,
        name: "Piano Forza – Upper/Lower",
        days: [
            {
                id: "D1",
                name: "Giorno 1 – Upper A",
                exercises: [
                    { id: "ex1", name: "Panca piana bilanciere", notes: "5x5 @75–80% 1RM", sets: [] },
                    { id: "ex2", name: "Rematore bilanciere", notes: "4x8–10", sets: [] },
                    { id: "ex3", name: "Spinte manubri inclinata", notes: "3x10–12", sets: [] },
                    { id: "ex4", name: "Alzate laterali", notes: "3x12–15", sets: [] },
                    { id: "ex5", name: "Curl bilanciere", notes: "3x8–12", sets: [] },
                ],
            },
            {
                id: "D2",
                name: "Giorno 2 – Lower A",
                exercises: [
                    { id: "ex6", name: "Back squat", notes: "5x5 @75–80% 1RM", sets: [] },
                    { id: "ex7", name: "Stacco RDL", notes: "4x6–8", sets: [] },
                    { id: "ex8", name: "Leg press", notes: "3x10–12", sets: [] },
                    { id: "ex9", name: "Leg curl", notes: "3x12–15", sets: [] },
                    { id: "ex10", name: "Calf raises", notes: "4x10–15", sets: [] },
                ],
            },
            {
                id: "D3",
                name: "Giorno 3 – Upper B",
                exercises: [
                    { id: "ex11", name: "Military press", notes: "5x5", sets: [] },
                    { id: "ex12", name: "Lat machine", notes: "4x8–10", sets: [] },
                    { id: "ex13", name: "Chest press", notes: "3x10–12", sets: [] },
                    { id: "ex14", name: "Face pull", notes: "3x12–15", sets: [] },
                    { id: "ex15", name: "Estensioni tricipiti", notes: "3x10–12", sets: [] },
                ],
            },
        ],
    });

    const [dayIndex, setDayIndex] = useState(0);
    const [exIndex, setExIndex] = useState(0);
    const currentDay = plan.days[dayIndex] || { exercises: [] };
    const currentExercise = currentDay.exercises[exIndex] || null;

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const ghostBtn = "inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 text-gray-600";
    const inputClass = "w-20 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none";

    async function loadPlan() {
        try {
            if (!API_BASE) return;
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/allenamenti/piani/${planId}`, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth?.accessToken ?? ""}` },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Errore caricamento piano");
            const data = await res.json();
            setPlan(data);
            setDayIndex(0);
            setExIndex(0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function addSet(exId) {
        setPlan((prev) => ({
            ...prev,
            days: prev.days.map((d, di) =>
                di !== dayIndex
                    ? d
                    : {
                        ...d,
                        exercises: d.exercises.map((ex) =>
                            ex.id === exId ? { ...ex, sets: [...(ex.sets || []), { weight: "", reps: "" }] } : ex
                        ),
                    }
            ),
        }));
    }

    function updateSet(exId, i, field, value) {
        setPlan((prev) => ({
            ...prev,
            days: prev.days.map((d, di) =>
                di !== dayIndex
                    ? d
                    : {
                        ...d,
                        exercises: d.exercises.map((ex) =>
                            ex.id === exId
                                ? {
                                    ...ex,
                                    sets: (ex.sets || []).map((s, si) => (si === i ? { ...s, [field]: value } : s)),
                                }
                                : ex
                        ),
                    }
            ),
        }));
    }

    function removeLastSet(exId) {
        setPlan((prev) => ({
            ...prev,
            days: prev.days.map((d, di) =>
                di !== dayIndex
                    ? d
                    : {
                        ...d,
                        exercises: d.exercises.map((ex) =>
                            ex.id === exId ? { ...ex, sets: (ex.sets || []).slice(0, -1) } : ex
                        ),
                    }
            ),
        }));
    }

    async function saveLogs() {
        try {
            setSaving(true);
            const payload = {
                planId: plan.id,
                dayId: currentDay?.id,
                entries: currentDay.exercises.map((ex) => ({
                    exerciseId: ex.id,
                    sets: (ex.sets || [])
                        .filter((s) => s.weight !== "" || s.reps !== "")
                        .map((s) => ({
                            weight: s.weight === "" ? null : Number(String(s.weight).replace(",", ".")),
                            reps: s.reps === "" ? null : Number(String(s.reps).replace(",", ".")),
                        })),
                })),
            };
            if (!API_BASE) {
                console.log("[FRONTEND ONLY] Logs workout:", payload);
                return;
            }
            const res = await fetch(`${API_BASE}/api/allenamenti/logs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth?.accessToken ?? ""}` },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Errore salvataggio log");
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        // loadPlan(); // scommenta quando il backend è pronto
    }, [planId]);

    const sliderRef = useRef(null);
    useEffect(() => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollTo({ left: exIndex * sliderRef.current.clientWidth, behavior: "smooth" });
    }, [exIndex]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold md:text-3xl">Allenamento</h1>
                        <p className="text-sm text-gray-500">Piano: {plan.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadPlan} className={baseBtn} disabled={loading}>
                            <RefreshCw className="h-4 w-4" /> {loading ? "Carico..." : "Aggiorna"}
                        </button>
                        <button onClick={saveLogs} className={baseBtn} disabled={saving}>
                            <Save className="h-4 w-4" /> {saving ? "Salvo..." : "Salva"}
                        </button>
                    </div>
                </div>

                <div className={`${baseCard} mb-4 p-2 md:p-3`}>
                    <div className="flex flex-wrap gap-2">
                        {plan.days.map((d, i) => (
                            <button
                                key={d.id}
                                onClick={() => {
                                    setDayIndex(i);
                                    setExIndex(0);
                                }}
                                className={`rounded-xl px-3 py-2 text-sm font-medium border ${i === dayIndex ? "bg-amber-100 border-amber-200 text-amber-900" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                            >
                                {d.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`${baseCard} p-0 overflow-hidden`}>
                    <div className="flex items-center justify-between border-b border-gray-200 p-3">
                        <div className="flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">{currentExercise?.name || "Nessun esercizio"}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className={ghostBtn} disabled={exIndex === 0} onClick={() => setExIndex((i) => Math.max(0, i - 1))}>
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-sm text-gray-500">
                {Math.min(exIndex + 1, currentDay.exercises.length)} / {currentDay.exercises.length}
              </span>
                            <button
                                className={ghostBtn}
                                disabled={exIndex >= currentDay.exercises.length - 1}
                                onClick={() => setExIndex((i) => Math.min(currentDay.exercises.length - 1, i + 1))}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div ref={sliderRef} className="relative flex w-full snap-x snap-mandatory overflow-x-hidden">
                        {currentDay.exercises.map((ex) => (
                            <div key={ex.id} className="w-full shrink-0 snap-center p-4">
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">{ex.notes}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <button onClick={() => addSet(ex.id)} className={baseBtn}>
                                            <Plus className="h-4 w-4" /> Aggiungi set
                                        </button>
                                        <button onClick={() => removeLastSet(ex.id)} className={baseBtn}>
                                            <Trash2 className="h-4 w-4" /> Rimuovi ultimo
                                        </button>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-2">
                                        {(ex.sets || []).length === 0 && (
                                            <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">Nessun set inserito. Premi "+" per aggiungere.</div>
                                        )}

                                        {(ex.sets || []).map((s, i) => (
                                            <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white p-3">
                                                <div className="text-sm font-medium text-gray-700">Set {i + 1}</div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm text-gray-500">Kg</label>
                                                    <input
                                                        className={inputClass}
                                                        inputMode="decimal"
                                                        value={s.weight}
                                                        onChange={(e) => updateSet(ex.id, i, "weight", e.target.value)}
                                                        placeholder="0"
                                                    />
                                                    <label className="ml-2 text-sm text-gray-500">Reps</label>
                                                    <input
                                                        className={inputClass}
                                                        inputMode="numeric"
                                                        value={s.reps}
                                                        onChange={(e) => updateSet(ex.id, i, "reps", e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
