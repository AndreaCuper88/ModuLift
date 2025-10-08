import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Save, RefreshCw, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {getWorkoutPlanById, upsertWorkout} from "../../api/clienteApi/allenamentoApi";
import RestTimer from "../../components/RestTimer";

// ------------------------------------------------------
// ModuLift – Allenamento (selezione giorno + slider esercizi + log set) – Frontend only
// ------------------------------------------------------

export default function WorkoutPage({setAlert}) {
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [search] = useSearchParams();
    const planId = search.get("planId") || search.get("id") || "template";
    const [loadingPlan, setLoadingPlan] = useState(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);


    const [exercisesCatalog, setExercisesCatalog] = useState({});

    const [plan, setPlan] = useState({}); //Conterrà il piano di allenamento recuperato dal db

    const dayKeys = useMemo(() => {
        const days = plan?.plan || {};
        const keys = [];
        for (let i = 1; ; i++) {
            const k = `day-${i}`;
            if (!Object.prototype.hasOwnProperty.call(days, k)) break;
            const arr = days[k];
            if (!Array.isArray(arr) || arr.length === 0) break; // Stop al primo "buco"
            keys.push(k);
        }
        return keys;
    }, [plan]);
    const [dayIndex, setDayIndex] = useState(0);
    const [exIndex, setExIndex] = useState(0);
    const dayKey = dayKeys[dayIndex] || null;
    const currentItems = dayKey ? plan.plan[dayKey] : [];
    const currentItem = currentItems[exIndex] || null;
    const currentExerciseMeta = currentItem ? exercisesCatalog[currentItem.exerciseId] : null;

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const ghostBtn = "inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 text-gray-600";
    const inputClass = "w-20 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none";

    const loadPlan = useCallback(async () => {
        if (!planId) return;
        try {
            setLoadingPlan(true);
            const data = await getWorkoutPlanById(planId, auth.accessToken);
            setPlan(data.plan);
            setExercisesCatalog(data.catalog);
            console.log(data);
            //setAlert({ message: "Piano allenamento caricato", type: "success" });
        } catch (e) {
            setPlan(null);
            setAlert({ message: e.message || "Errore caricamento piano", type: "danger" });
        } finally {
            setLoadingPlan(false);
        }
    }, [planId, auth.accessToken]);

    const [logs, setLogs] = useState({});
    const logKey = (dk, exId) => `${dk}|${exId}`;
    const getSets = (dk, exId) => logs[logKey(dk, exId)] || [];

    function addSet(exId) {
        setLogs((prev) => {
            const k = logKey(dayKey, exId);
            const prevSets = prev[k] || [];
            return { ...prev, [k]: [...prevSets, { weight: "", reps: "" }] };
        });
        console.log(logs)
    }

    function updateSet(exId, i, field, value) {
        setLogs((prev) => {
            const k = logKey(dayKey, exId);
            const arr = prev[k] || [];
            const next = arr.map((s, si) => (si === i ? { ...s, [field]: value } : s));
            return { ...prev, [k]: next };
        });
    }

    function removeLastSet(exId) {
        setLogs((prev) => {
            const k = logKey(dayKey, exId);
            const arr = prev[k] || [];
            return { ...prev, [k]: arr.slice(0, -1) };
        });
    }

    async function saveLogs() {
        try {
            setSaving(true);
            const payload = {
                planId: planId,
                dayId: dayKey,
                entries: (currentItems || []).map((item) => ({
                    exerciseId: item.exerciseId,
                    uid: item.uid,
                    sets: (getSets(dayKey, item.exerciseId) || [])
                        .filter((s) => s.weight !== "" || s.reps !== "")
                        .map((s) => ({
                            weight: s.weight === "" ? null : Number(String(s.weight).replace(",", ".")),
                            reps: s.reps === "" ? null : Number(String(s.reps).replace(",", ".")),
                        })),
                })),
            };

            const res = await upsertWorkout({
                token: auth.accessToken,
                planId,
                dayId: payload.dayId,
                entries: payload.entries
            });

        } catch (e) {
            console.error(e);
        } finally {
            setAlert({ message: "Allenamento salvato correttamente", type: "success" });
            setSaving(false);
        }
    }

    useEffect(() => {
        loadPlan();
    }, [planId]);

    const sliderRef = useRef(null);
    useEffect(() => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollTo({ left: exIndex * sliderRef.current.clientWidth, behavior: "smooth" });
    }, [exIndex]);

    const formatScheme = (scheme = []) =>
        scheme.map((s, i) => `${s.count}x${s.reps}`).join(" · ");

    const dayLabel = (key) => `Giorno ${key.split('-')[1]}`;

    //Gestione timer
    const [playing, setPlaying] = useState(false);
    const [resetNonce, setResetNonce] = useState(0);

    // reset al cambio esercizio
    useEffect(() => {
        setPlaying(false);
        setResetNonce(n => n + 1);
    }, [currentItem?.uid]);

    const handleTap = () => {
        if (!playing) {
            // 1° tap: avvia
            setPlaying(true);
        } else {
            // 2° tap: reset e fermo
            setPlaying(false);
            setResetNonce(n => n + 1);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold md:text-3xl">Allenamento</h1>
                        <p className="text-sm text-gray-500">Piano: {plan.name || plan._id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadPlan} className={baseBtn} disabled={loading}>
                            <RefreshCw className="h-4 w-4" /> {loading ? "Carico..." : "Aggiorna"}
                        </button>
                        {saving ? (
                            <button className={baseBtn} disabled={true}>
                                <div role="status">
                                    <svg aria-hidden="true"
                                         className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"/>
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </button>
                        ) : (
                            <button onClick={saveLogs} className={baseBtn} disabled={saving}>
                                <Save className="h-4 w-4" /> {saving ? "Salvo..." : "Salva"}
                            </button>
                        )}
                    </div>
                </div>

                <div className={`${baseCard} mb-4 p-2 md:p-3`}>
                    <div className="flex flex-wrap gap-2">
                        {dayKeys.map((dk, i) => (
                            <button
                                key={dk}
                                onClick={() => { setDayIndex(i); setExIndex(0); }}
                                className={`rounded-xl px-3 py-2 text-sm font-medium border ${i === dayIndex ? "bg-amber-100 border-amber-200 text-amber-900" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                            >
                                {dayLabel(dk)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`${baseCard} p-0 overflow-hidden`}>
                    {/* Header esercizio */}
                    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4 md:gap-6 border-b border-gray-200 p-4">
                        <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm">
                            {currentExerciseMeta?.imagePath ? (
                                <img
                                    src={`${API_BASE}/uploads/exercises/${currentExerciseMeta.muscle}/${currentExerciseMeta.imagePath}`}
                                    alt={currentExerciseMeta?.name || "Esercizio"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Dumbbell className="h-9 w-9 text-gray-400" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-semibold leading-tight truncate">
                                {currentExerciseMeta?.name || currentItem?.exerciseId || "Nessun esercizio"}
                            </h2>
                            {currentItem && (
                                <p className="mt-2 text-xs md:text-sm text-gray-600">
                                    Schema: {formatScheme(currentItem.scheme)} · Recupero: {currentItem.rest}s
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1 md:gap-2">
                            <button
                                className={ghostBtn}
                                disabled={exIndex === 0}
                                onClick={() => setExIndex((i) => Math.max(0, i - 1))}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="px-2 py-1 rounded-full border border-gray-200 bg-white text-sm text-gray-600 tabular-nums whitespace-nowrap">
                                {Math.min(exIndex + 1, currentItems.length)} / {currentItems.length}
                            </span>
                            <button
                                className={ghostBtn}
                                disabled={exIndex >= currentItems.length - 1}
                                onClick={() => setExIndex((i) => Math.min(currentItems.length - 1, i + 1))}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-start justify-between gap-4 md:gap-6">
                            {/* NOTE  */}
                            <div className="flex-1">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                    <div className="mb-1 text-[11px] md:text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Note esercizio
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {currentItem?.notes || "—"}
                                    </p>
                                </div>
                            </div>

                            {/* TIMER  */}
                            <div className="shrink-0 text-center select-none">
                                <div
                                    role="button"
                                    className="cursor-pointer inline-block"
                                    onClick={handleTap}
                                    title={playing ? "Reset" : "Start"}
                                >
                                    <RestTimer
                                        seconds={Number(currentItem?.rest ?? 90)}
                                        playing={playing}
                                        resetKey={`${currentItem?.uid}-${resetNonce}`} // cambia => reset
                                        size={80}
                                        strokeWidth={6}
                                    />
                                </div>
                                <div className="mt-1 text-[10px] text-gray-500">
                                    {playing ? "Tocca per reset" : "Tocca per avviare"}
                                </div>
                            </div>
                        </div>
                    </div>




                    <div ref={sliderRef} className="relative flex w-full snap-x snap-mandatory overflow-x-hidden">
                        {currentItems.map((item) => {
                            const meta = exercisesCatalog[item.exerciseId] || {};
                            const sets = getSets(dayKey, item.exerciseId);
                            return (
                                <div key={item.uid} className="w-full shrink-0 snap-center p-4">
                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">{item.notes || ""}</p>
                                        <p className="mt-1 text-xs text-gray-500">Schema: {formatScheme(item.scheme)} · Recupero: {item.rest}s</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <button onClick={() => addSet(item.exerciseId)} className={baseBtn}>
                                                <Plus className="h-4 w-4" /> Aggiungi set
                                            </button>
                                            <button onClick={() => removeLastSet(item.exerciseId)} className={baseBtn}>
                                                <Trash2 className="h-4 w-4" /> Rimuovi ultimo
                                            </button>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-2">
                                            {sets.length === 0 && (
                                                <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">Nessun set inserito. Premi "+" per aggiungere.</div>
                                            )}

                                            {sets.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white p-3">
                                                    <div className="text-sm font-medium text-gray-700">Set {i + 1}</div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm text-gray-500">Kg</label>
                                                        <input
                                                            className={inputClass}
                                                            inputMode="decimal"
                                                            value={s.weight}
                                                            onChange={(e) => updateSet(item.exerciseId, i, "weight", e.target.value)}
                                                            placeholder="0"
                                                        />
                                                        <label className="ml-2 text-sm text-gray-500">Reps</label>
                                                        <input
                                                            className={inputClass}
                                                            inputMode="numeric"
                                                            value={s.reps}
                                                            onChange={(e) => updateSet(item.exerciseId, i, "reps", e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}