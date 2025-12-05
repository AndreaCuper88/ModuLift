import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, TrendingUp, Scale, HeartPulse, Target, CalendarDays, Utensils, Activity, ChevronRight } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import UserCard from "../../components/UserCard";
import useAuth from "../../hooks/useAuth";

// ModuLift – Dashboard Cliente (Frontend only)

function Sparkline({ data = [], width = 160, height = 42, className = "" }) {
    const points = useMemo(() => {
        if (!data.length) return "";
        const vals = data.map((d) => Number(d?.value ?? d));
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        const range = max - min || 1;
        return vals
            .map((v, i) => {
                const x = (i / Math.max(vals.length - 1, 1)) * width;
                const y = height - ((v - min) / range) * height;
                return `${x},${y}`;
            })
            .join(" ");
    }, [data, width, height]);
    return (
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className}>
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

export default function ClientDashboard() {
    const { id } = useParams();
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        name: "Mario Rossi",
        weightKg: 78.6,
        heightCm: 178,
        bmi: 24.8,
        fatPercent: 14.8,
        calorieTarget: 2300,
        proteinTarget: 160,
        carbsTarget: 220,
        fatsTarget: 60,
        nextWorkout: { date: "2025-08-18", name: "Upper A" },
        weekWorkoutsDone: 3,
        weekWorkoutsGoal: 4,
        nutritionAdherence: 0.78,
    });

    const [weightTrend, setWeightTrend] = useState([
        { date: "2025-07-21", value: 80.1 },
        { date: "2025-07-28", value: 79.6 },
        { date: "2025-08-04", value: 79.2 },
        { date: "2025-08-11", value: 78.9 },
        { date: "2025-08-18", value: 78.6 },
    ]);

    const [latestSites, setLatestSites] = useState({ chest: 10, abdomen: 17, thigh: 14 });
    const [latestAnthro, setLatestAnthro] = useState({ toraceCm: 100.8, spalleCm: 121.3, bicipiteCm: 36.7, ombelicoCm: 90.0, quadricipiteCm: 58.3 });

    const deltaWeight = useMemo(() => {
        if (weightTrend.length < 2) return 0;
        return Number((weightTrend[weightTrend.length - 1].value - weightTrend[0].value).toFixed(1));
    }, [weightTrend]);

    const sum3 = useMemo(() => {
        const s = Number(latestSites?.chest || 0) + Number(latestSites?.abdomen || 0) + Number(latestSites?.thigh || 0);
        return s || 0;
    }, [latestSites]);

    async function loadDashboard() {
        try {
            if (!API_BASE) return;
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/dashboard/clienti/${id}`, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth?.accessToken ?? ""}` },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Errore caricamento dashboard");
            const data = await res.json();
            // setSummary(data.summary); setWeightTrend(data.weightTrend); setLatestSites(data.latestSites); setLatestAnthro(data.latestAnthro);
            // Adatta i campi sopra quando il backend è pronto
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, API_BASE]);

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const smallBadge = "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900";

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard cliente</h1>
                        <p className="text-sm text-gray-500">Quadro generale aggiornato</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserCard idUtente={auth.user?.id} />
                        <button onClick={loadDashboard} className={baseBtn} disabled={loading}>
                            <RefreshCw className="h-4 w-4" /> {loading ? "Aggiorno..." : "Aggiorna"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Peso attuale</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold">{summary.weightKg} kg</span>
                                    <span className={`${smallBadge} ${deltaWeight <= 0 ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-800"}`}>
                    <TrendingUp className="h-3 w-3" /> {deltaWeight > 0 ? `+${deltaWeight}` : `${deltaWeight}`} kg
                  </span>
                                </div>
                            </div>
                            <Scale className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="mt-3 text-gray-500">
                            <Sparkline data={weightTrend} className="text-amber-600" />
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">BMI</p>
                                <div className="mt-1 text-2xl font-semibold">{summary.bmi}</div>
                                <p className="text-xs text-gray-500">Altezza: {summary.heightCm} cm</p>
                            </div>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Massa grassa stimata</p>
                                <div className="mt-1 text-2xl font-semibold">{summary.fatPercent}%</div>
                                <p className="text-xs text-gray-500">Σ3: {sum3} mm</p>
                            </div>
                            <HeartPulse className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Target calorico</p>
                                <div className="mt-1 text-2xl font-semibold">{summary.calorieTarget} kcal</div>
                                <p className="text-xs text-gray-500">P {summary.proteinTarget}g · C {summary.carbsTarget}g · G {summary.fatsTarget}g</p>
                            </div>
                            <Target className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className={`${baseCard} p-4 xl:col-span-2`}>
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-gray-500" />
                                <h3 className="text-lg font-semibold">Allenamenti</h3>
                            </div>
                            <span className="text-sm text-gray-500">Questa settimana: {summary.weekWorkoutsDone}/{summary.weekWorkoutsGoal}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">Prossimo allenamento</p>
                                <p className="mt-1 text-lg font-medium">{summary.nextWorkout.name}</p>
                                <p className="text-sm text-gray-600">{summary.nextWorkout.date}</p>
                                <Link to={`/clienti/${id}/allenamenti`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                                    Apri calendario <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">Adesione nutrizionale</p>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div className="h-full bg-amber-500" style={{ width: `${Math.round(summary.nutritionAdherence * 100)}%` }} />
                                </div>
                                <p className="mt-2 text-sm text-gray-700">{Math.round(summary.nutritionAdherence * 100)}% dei target rispettati</p>
                                <Link to={`/clienti/${id}/piani-alimentari`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                                    Vedi piano <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                            <Utensils className="h-5 w-5 text-gray-500" />
                            <h3 className="text-lg font-semibold">Sintesi giornaliera</h3>
                        </div>
                        <ul className="mt-4 space-y-3 text-sm">
                            <li className="flex items-center justify-between">
                                <span className="text-gray-600">Kcal consumate</span>
                                <span className="font-medium">2.180 / {summary.calorieTarget}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-gray-600">Proteine</span>
                                <span className="font-medium">152g / {summary.proteinTarget}g</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-gray-600">Carboidrati</span>
                                <span className="font-medium">205g / {summary.carbsTarget}g</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-gray-600">Grassi</span>
                                <span className="font-medium">58g / {summary.fatsTarget}g</span>
                            </li>
                        </ul>
                        <Link to={`/clienti/${id}/piani-alimentari`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                            Dettaglio pasti <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className={`${baseCard} p-4`}>
                        <h3 className="border-b border-gray-200 pb-3 text-lg font-semibold">Ultime misure</h3>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-gray-500">Torace</p><p className="text-lg font-semibold">{latestAnthro.toraceCm} cm</p></div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-gray-500">Spalle</p><p className="text-lg font-semibold">{latestAnthro.spalleCm} cm</p></div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-gray-500">Bicipite</p><p className="text-lg font-semibold">{latestAnthro.bicipiteCm} cm</p></div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-gray-500">Ombelico</p><p className="text-lg font-semibold">{latestAnthro.ombelicoCm} cm</p></div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-gray-500">Quadricipite</p><p className="text-lg font-semibold">{latestAnthro.quadricipiteCm} cm</p></div>
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <h3 className="border-b border-gray-200 pb-3 text-lg font-semibold">Ultime pliche</h3>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center"><p className="text-gray-500">Pettorale</p><p className="text-lg font-semibold">{latestSites.chest} mm</p></div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center"><p className="text-gray-500">Addominale</p><p className="text-lg font-semibold">{latestSites.abdomen} mm</p></div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center"><p className="text-gray-500">Coscia</p><p className="text-lg font-semibold">{latestSites.thigh} mm</p></div>
                        </div>
                        <Link to={`/clienti/${id}/misure`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                            Vai alle misure <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
