import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, RefreshCw, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {getWorkoutPlanById, upsertWorkout} from "../../api/clienteApi/allenamentoApi";
import RestTimer from "../../components/RestTimer";
import {db} from "../../db/db";

// ------------------------------------------------------
// ModuLift – Allenamento (selezione giorno + slider esercizi + log set)
// ------------------------------------------------------

export default function WorkoutPage({setAlert}) {
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [search] = useSearchParams();


    const urlPlanId = search.get("planId") || search.get("id");
    const storedPlanId = localStorage.getItem("latestPlanId");
    const planId = urlPlanId || storedPlanId || "template";
    const [loading, setLoading] = useState(false);
    const [exercisesCatalog, setExercisesCatalog] = useState({});
    const [plan, setPlan] = useState(null); //Conterrà il piano di allenamento recuperato dal db

    const [sessionActive, setSessionActive] = useState(false); //Per la gestione della sessione del singolo allenamento

    //Gestione online/offline: capisco se il browser è online o meno
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline); // "quando window emette 'online', esegui handleOnline"
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            // Rimuovo i listner quando viene smontato il componente
        };
    }, []);

    //Fine gestione online/offline


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
    const currentItems = (dayKey && plan?.plan?.[dayKey]) ? plan.plan[dayKey] : [];
    const currentItem = currentItems[exIndex] || null;
    const currentExerciseMeta = currentItem ? exercisesCatalog[currentItem.exerciseId] : null;

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const ghostBtn = "inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 text-gray-600";
    const inputClass = "w-20 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none";

    const loadingRef = useRef(false); //Flag senza causare re-render di Workout Page

    const loadPlan = useCallback(async () => {
        if (loadingRef.current) return; // evita chiamate doppie
        loadingRef.current = true;  //Setto true

        const cacheKey = `plan_${planId}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {       //Se ho dati offline inizio a mostrarli
            try {
                const parsed = JSON.parse(cached);
                setPlan(parsed.plan);
                setExercisesCatalog(parsed.catalog);
            } catch (_) {}
        }

        if (!navigator.onLine) {
            console.log("offline → uso cache");

            if (!cached) {  //Se non ho dati memorizzati dai errore
                setPlan(null);
                setAlert({
                    message: "Sei offline e non hai dati in cache.",
                    type: "warning"
                });
            }

            loadingRef.current = false;
            return;
        }

        try {   //Effettuo chiamata se online
            setLoading(true);
            const data = await getWorkoutPlanById(planId, auth.accessToken);
            setPlan(data.plan);
            setExercisesCatalog(data.catalog);
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
            if (!cached) {
                setPlan(null);
                setAlert({ message: "Errore recupero piano", type: "danger" });
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
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
        const payload = {   //Costruzione payload
            planId: planId,
            dayId: dayKey,
            sessionId: currentSessionId,
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

        //Salvo sempre in coda
        const queueId = await db.syncQueue.add({    //Salvo in idexdb, in coda
            tipo: "workoutProgress",
            operazione: "update",
            payload,
            timestamp: Date.now()
        });
        await db.workoutProgress.put({  //Salvo localmente in indexdb dentro WorkoutProgress per ripristinare i log se chiudo l'app o aggiorno nel mentre
            planId,
            sessionId: currentSessionId,
            dayKey,
            logs,  // salvi tutto il logs state così com'è
            updatedAt: Date.now()
        });

        //Se online provo il sync
        if (isOnline) {
            try {
                await upsertWorkout({
                    token: auth.accessToken,
                    planId,
                    dayId: payload.dayId,
                    sessionId: currentSessionId,
                    entries: payload.entries
                });

                //Rimuovo dalla coda una volta salvato
                await db.syncQueue.delete(queueId);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const isLoadingLogs = useRef(false);
    const hasLoadedLogs = useRef(false);

    useEffect(() => {
        async function loadLogs() {
            if (dayKeys.length === 0) return;   //aspetto che dayKey sia popolato
            if (hasLoadedLogs.current) return; // gira solo una volta
            hasLoadedLogs.current = true;

            isLoadingLogs.current = true;
            const saved = await db.workoutProgress //Prendo l'ultimo record salvato
                .where("planId")
                .equals(planId)
                .last();
            if (saved?.logs) {  //Ripristino tutto a seguito di un reload
                setLogs(saved.logs);
                setCurrentSessionId(saved.sessionId);
                setSessionActive(true);
                if (saved.dayKey) {
                    const idx = dayKeys.indexOf(saved.dayKey);
                    if (idx !== -1) setDayIndex(idx);
                }
            }
            isLoadingLogs.current = false;
        }
        loadLogs();
    }, [planId, dayKeys]);

    const [currentSessionId, setCurrentSessionId] = useState(null);

    async function startSession() {
        const sessionId = crypto.randomUUID();
        setSessionActive(true);
        setCurrentSessionId(sessionId);
        await db.workoutProgress.put({ planId, sessionId, dayKey, logs: {}, updatedAt: Date.now() });
    }

    async function endSession() {
        await saveLogs(); //Salvo e provo a sincronizzare con db
        await db.workoutProgress    //Elimino la copia locale per il ripristino dei dati in caso di reload
            .where("[planId+sessionId]")
            .equals([planId, currentSessionId])
            .delete();
        setLogs({});
        setSessionActive(false);
        setCurrentSessionId(null);
    }

    const debounceRef = useRef(null);

    useEffect(() => {
        if (Object.keys(logs).length === 0) return;
        if (isLoadingLogs.current) return; // ← non salvare durante il caricamento

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            saveLogs();
        }, 2000);

        return () => clearTimeout(debounceRef.current);
    }, [logs]);


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


    //Sincronizzazione salvataggi
    useEffect(() => {
        async function trySync() {
            if (!isOnline) return;

            const all = await db.syncQueue
                .where("tipo")
                .equals("workoutProgress")
                .toArray(); //Prendo tutti i record in coda
            if (!all.length) return; //Se la coda è vuota mi fermo

            for (const item of all) {
                try {
                    await upsertWorkout({ // manda al server
                        token: auth.accessToken,
                        planId: item.payload.planId,
                        dayId: item.payload.dayId,
                        sessionId: item.payload.sessionId,
                        entries: item.payload.entries,
                    });

                    // rimuovo dalla queue se ok
                    await db.syncQueue.delete(item.id);

                } catch (e) {
                    console.error("Errore sync log:", e);
                    // lo lascio in queue , retry futuro
                }
            }

            // opzionale feedback
            const remaining = await db.syncQueue.count();
            if (remaining === 0) {
                setAlert({
                    message: "Allenamenti offline sincronizzati con successo.",
                    type: "success",
                });
            }
        }

        window.addEventListener("online", trySync); //Ascolto il ritorno online

        // sync immediato se già online
        trySync();

        return () => window.removeEventListener("online", trySync); //cleanup
    }, [auth.accessToken, isOnline]);



    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold md:text-3xl">Allenamento</h1>
                        <p className="text-sm text-gray-500">Piano: {plan?._id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadPlan} className={baseBtn} disabled={loading}>
                            <RefreshCw className="h-4 w-4" /> {loading ? "Carico..." : "Aggiorna"}
                        </button>
                    </div>
                </div>

                <div className={`${baseCard} mb-4 p-2 md:p-3`}>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                            {dayKeys.map((dk, i) => (
                                <button
                                    key={dk}
                                    disabled={sessionActive}
                                    onClick={() => { setDayIndex(i); setExIndex(0); }}
                                    className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
                                        i === dayIndex
                                            ? "bg-amber-100 border-amber-200 text-amber-900"
                                            : sessionActive
                                                ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {dayLabel(dk)}
                                </button>
                            ))}
                        </div>

                        {!sessionActive ? (
                            <button onClick={startSession} className={baseBtn}>
                                Inizia
                            </button>
                        ) : (
                            <button onClick={endSession} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-white bg-red-400 hover:bg-red-500 active:bg-red-600 transition">
                                Termina
                            </button>
                        )}
                    </div>
                </div>

                {sessionActive ? (
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
                ) : (
                    <div className={`${baseCard} p-4`}>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">Esercizi del giorno</p>
                <div className="flex flex-col gap-2">
                    {currentItems.length === 0 ? (
                        <p className="text-sm text-gray-400">Seleziona un giorno per vedere gli esercizi.</p>
                    ) : (
                        currentItems.map((item) => {
                            const meta = exercisesCatalog[item.exerciseId] || {};
                            return (
                                <div key={item.uid} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                    <Dumbbell className="h-4 w-4 text-gray-400 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{meta.name || item.exerciseId}</p>
                                        <p className="text-xs text-gray-500">{formatScheme(item.scheme)} · Recupero: {item.rest}s</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            )
                }
            </div>
        </div>
    );
}