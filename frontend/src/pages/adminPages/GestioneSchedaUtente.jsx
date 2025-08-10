import React, {useEffect, useMemo, useState} from "react";
import { Plus, Trash2, Search, ClipboardList, ChevronUp, ChevronDown, X } from "lucide-react";
import {getCliente, getExercises} from "../../api/editorSchedeApi";
import {useParams} from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ExerciseModal from "../../components/exerciseModal";

const TEMPLATE_DAYS = Array.from({ length: 7 }, (_, i) => ({ id: `day-${i + 1}`, label: `Giorno ${i + 1}` }));

export default function CoachWorkoutEditor() {
    const {id} = useParams();
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;

    const [EXERCISE_LIBRARY, setExerciseList] = useState([]);

    const [query, setQuery] = useState("");
    const [muscleFilter, setMuscleFilter] = useState("tutti");
    const [activeDay, setActiveDay] = useState(TEMPLATE_DAYS[0].id);
    const [plan, setPlan] = useState(Object.fromEntries(TEMPLATE_DAYS.map((d) => [d.id, []])));
    const [weeks, setWeeks] = useState(4);
    const [user, setUser] = useState(null); //Utente di cui sto modificando la scheda
    const [loadingUser, setLoadingUser] = useState(true); //Gestione caricamento utente
    const [loadingExercises, setLoadingExercises] = useState(true); //Gestione caricamento esercizi
    const [isOpen, setIsOpen] = useState(false); //Gestione modal aggiunta esercizio

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const esercizi = await getExercises(auth.accessToken);
                setExerciseList(esercizi || []);
            } catch (e) {
                console.error("Errore nel caricamento degli esercizi:", e);
            } finally {
                setLoadingExercises(false);
            }
        };
        fetchExercises();
    }, []);

    const muscles = useMemo(() => [
        "tutti",
        ...Array.from(new Set((EXERCISE_LIBRARY || []).map(e => e.muscle)))
    ], [EXERCISE_LIBRARY]);

    const filtered = useMemo(() => (EXERCISE_LIBRARY || []).filter((ex) => {
        const byQuery = query.trim() === "" || ex.name.toLowerCase().includes(query.toLowerCase());
        const byMuscle = muscleFilter === "tutti" || ex.muscle === muscleFilter;
        return byQuery && byMuscle;
    }), [query, muscleFilter, EXERCISE_LIBRARY]);

    const addToDay = (exercise) => {
        const idVal = exercise._id || exercise.id;
        const imageUrl = exercise.image || (exercise.imagePath ? `${API_BASE}/uploads/exercises/${exercise.muscle}/${exercise.imagePath}` : "");
        setPlan((prev) => {
            const next = { ...prev };
            next[activeDay] = [
                ...next[activeDay],
                { uid: `${idVal}-${Date.now()}`, id: idVal, name: exercise.name, muscle: exercise.muscle, image: imageUrl, scheme: [{ count: 1, reps: 12 }], rest: 90, notes: "" }
            ];
            return next;
        });
    };

    const removeExerciseFromLibrary = (exId) => {
        setExerciseList((prev) => prev.filter((e) => (e._id || e.id) !== exId));
    };

    const removeFromDay = (dayId, uid) => setPlan((prev) => ({ ...prev, [dayId]: prev[dayId].filter((i) => i.uid !== uid) }));
    const updateExercise = (dayId, uid, patch) => setPlan((prev) => ({ ...prev, [dayId]: prev[dayId].map((i) => (i.uid === uid ? { ...i, ...patch } : i)) }));
    const totalExercises = plan[activeDay]?.length ?? 0;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const utente = await getCliente(id,auth.accessToken);
                setUser(utente);
            } catch (e) {
                console.error("Errore nel caricamento del cliente:", e);
            }
            finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    },[]);

    const handleSave = () => {
        const payload = { userId: id, weeks, plan };
        console.log("Salva scheda:", payload);
    };

    return (
        <div className="min-h-screen w-full bg-white p-4 md:p-6 lg:p-8 text-gray-900">
            <ExerciseModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            token={auth.accessToken}
            onCreated={(ex) => {
                setExerciseList((prev) => [ex, ...prev]);   //Aggiorno lista esercizi locale
            }}
            />
            <div className="mx-auto max-w-[1400px]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-6 w-6" />
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Editor Schede</h1>
                    </div>
                    {loadingUser ? (
                        <div role="status">
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    ):(
                        <div className="flex items-center gap-3">
                            <img src={`${API_BASE}/${user.avatarPath}`} alt="User" className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex flex-col">
                                <span className="font-semibold">{user.nome} {user.cognome}</span>
                                <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col max-h-[78vh]">
                        <div className="flex items-center gap-2 mb-4">
                            <Search className="w-5 h-5 text-gray-500" />
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca esercizio..." className="flex-1 border rounded-lg px-3 py-2" />
                            <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                                {muscles.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
                            {filtered.map((ex) => (
                                <div key={ex._id || ex.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                                    {(ex.imagePath || ex.image) && (
                                        <img
                                            src={ex.image ? ex.image : `${API_BASE}/uploads/exercises/${ex.muscle}/${ex.imagePath}`}
                                            alt={ex.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{ex.name}</h3>
                                        <p className="text-xs text-gray-500">{ex.muscle.charAt(0).toUpperCase() + ex.muscle.slice(1)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => addToDay(ex)} className="p-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                                        <button onClick={() => removeExerciseFromLibrary(ex._id || ex.id)} className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" title="Elimina esercizio"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-center p-3 border rounded-lg bg-gray-50 min-h-[86px]">
                                <button type="button" className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center" aria-label="Aggiungi nuovo esercizio" onClick={() => setIsOpen(true)}>
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col max-h-[78vh]">
                        <div className="flex gap-2 mb-4 overflow-x-auto">
                            {TEMPLATE_DAYS.map((day) => (
                                <button key={day.id} onClick={() => setActiveDay(day.id)} className={`px-4 py-2 rounded-lg border ${activeDay === day.id ? "bg-blue-600 text-white" : "bg-gray-50"}`}>{day.label}</button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold">Esercizi del giorno</h2>
                            {totalExercises > 0 && <button onClick={() => setPlan((prev) => ({ ...prev, [activeDay]: [] }))} className="text-sm text-red-600">Svuota</button>}
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {plan[activeDay].map((item) => (
                                <div key={item.uid} className="flex flex-col gap-3 p-3 border rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-500">{item.muscle.charAt(0).toUpperCase() + item.muscle.slice(1)}</p>
                                        </div>
                                        <button onClick={() => removeFromDay(activeDay, item.uid)} className="p-2 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div className="space-y-2">
                                        <SetsEditor scheme={item.scheme} onChange={(next) => updateExercise(activeDay, item.uid, { scheme: next })} />
                                        <div className="grid grid-cols-[80px_1fr] gap-3">
                                            <NumberField label="Recupero" value={item.rest} onChange={(v) => updateExercise(activeDay, item.uid, { rest: v })} suffix="s" />
                                            <TextField label="Note del coach" value={item.notes} onChange={(v) => updateExercise(activeDay, item.uid, { notes: v })} placeholder="Note del coach" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="sticky bottom-0 bg-white pt-3 mt-3 border-t flex items-center justify-end gap-3">
                            <label className="text-sm text-gray-600 flex items-center gap-2">
                                Durata (settimane)
                                <input
                                    type="number"
                                    min={1}
                                    value={weeks}
                                    onChange={(e) => setWeeks(Math.max(1, Number(e.target.value)))}
                                    className="w-20 text-center border rounded-lg px-2 py-2"
                                />
                            </label>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Salva</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SetsEditor({ scheme, onChange }) {
    const addRow = () => onChange([...(scheme || []), { count: 1, reps: 10 }]);
    const removeRow = (idx) => onChange((scheme || []).filter((_, i) => i !== idx));
    const update = (idx, field, value) => onChange((scheme || []).map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
    return (
        <div className="border rounded-lg bg-white p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500">Schema serie</div>
                <button onClick={addRow} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-gray-50"><Plus className="w-3 h-3" /> Aggiungi</button>
            </div>
            {(scheme || []).map((row, idx) => (
                <div key={idx} className="grid grid-cols-[auto_auto_auto] items-center gap-2">
                    <NumberFieldCompact label="Serie" value={row.count} onChange={(v) => update(idx, "count", v)} />
                    <NumberFieldCompact label="Rep" value={row.reps} onChange={(v) => update(idx, "reps", v)} />
                    <button onClick={() => removeRow(idx)} className="p-2 rounded border text-xs hover:bg-gray-50"><X className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
    );
}

function NumberField({ label, value, onChange, suffix }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">{label}</span>
            <div className="inline-flex items-center rounded-xl border bg-white overflow-hidden">
                <button onClick={() => onChange(Math.max(0, Number(value) - 1))} className="px-2 py-2 hover:bg-gray-50"><ChevronDown className="h-4 w-4" /></button>
                <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-14 text-center outline-none px-0 py-2 appearance-none" />
                <button onClick={() => onChange(Number(value) + 1)} className="px-2 py-2 hover:bg-gray-50"><ChevronUp className="h-4 w-4" /></button>
                {suffix && <div className="px-2 text-xs text-gray-500 select-none">{suffix}</div>}
            </div>
        </div>
    );
}

function NumberFieldCompact({ label, value, onChange }) {
    return (
        <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">{label}</span>
            <div className="inline-flex items-center rounded-lg border bg-white overflow-hidden">
                <button onClick={() => onChange(Math.max(0, Number(value) - 1))} className="px-2 py-1 hover:bg-gray-50"><ChevronDown className="h-3 w-3" /></button>
                <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-14 text-center outline-none px-0 py-1 appearance-none" />
                <button onClick={() => onChange(Number(value) + 1)} className="px-2 py-1 hover:bg-gray-50"><ChevronUp className="h-3 w-3" /></button>
            </div>
        </div>
    );
}

function TextField({ label, value, onChange, placeholder }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">{label}</span>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-xl border px-3 py-2 bg-white" />
        </div>
    );
}