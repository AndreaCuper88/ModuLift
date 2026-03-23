import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, Scale, HeartPulse, CalendarDays, Utensils, Activity, ChevronRight } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import UserCard from "../../components/UserCard";
import useAuth from "../../hooks/useAuth";

import { getLastWorkout } from "../../api/clienteApi/dashboardApi";
import { getLatestPiano } from "../../api/clienteApi/pianoalimentareApi";
import { getMisure, getAltezza } from "../../api/clienteApi/misureApi";

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

const INITIAL_SUMMARY = {
    name: "",
    weightKg: null,
    heightCm: null,
    bmi: null,
    fatPercent: null,
    nextWorkout: { date: "", name: "" },
    lastWorkout: { date: "", name: "" },
    weekWorkoutsDone: null,
    weekWorkoutsGoal: null,
    mealPlan: [],
};

const INITIAL_ANTHRO = {
    toraceCm: null,
    spalleCm: null,
    bicipiteCm: null,
    ombelicoCm: null,
    quadricipiteCm: null,
};

const INITIAL_SITES = {
    chest: null,
    abdomen: null,
    thigh: null,
};

export default function ClientDashboard() {
    const { id } = useParams();
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(INITIAL_SUMMARY);
    const [weightTrend, setWeightTrend] = useState([]);
    const [latestSites, setLatestSites] = useState(INITIAL_SITES);
    const [latestAnthro, setLatestAnthro] = useState(INITIAL_ANTHRO);

    const deltaWeight = useMemo(() => {
        if (weightTrend.length < 2) return null;
        return Number((weightTrend[weightTrend.length - 1].value - weightTrend[0].value).toFixed(1));
    }, [weightTrend]);

    const sum3 = useMemo(() => {
        const { chest, abdomen, thigh } = latestSites;
        if (chest === null && abdomen === null && thigh === null) return null;
        return Number(chest || 0) + Number(abdomen || 0) + Number(thigh || 0);
    }, [latestSites]);


    async function loadPianoAlimentare() {
        try {
            const piano = await getLatestPiano(auth?.accessToken);
            setSummary(prev => ({ ...prev, mealPlan: piano.meals ?? [] }));
            //console.log(piano);
        } catch (e) {
            console.error("Errore caricamento piano alimentare:", e.message);
        }
    }

    useEffect(() => {
        loadPianoAlimentare();
    }, [id, API_BASE]);

    useEffect(() => {
        if (!auth?.accessToken || !auth?.user?.id) return;

        async function loadMisure() {
            try {
                const [data, altezzaVal] = await Promise.all([
                    getMisure(auth.accessToken),
                    getAltezza(auth.user.id, auth.accessToken).catch(() => null)
                ]);

                if (!data?.length) return;

                const latest = data[data.length - 1];

                // BMI
                const bmi = altezzaVal && latest.pesoKg
                    ? Number((latest.pesoKg / Math.pow(altezzaVal / 100, 2)).toFixed(1))
                    : null;

                setWeightTrend(data.map((m) => ({ value: m.pesoKg })));

                setSummary(prev => ({
                    ...prev,
                    weightKg:   latest.pesoKg ?? null,
                    heightCm:   altezzaVal    ?? null,
                    bmi,
                    fatPercent: latest.derived?.fatPercent != null
                        ? Number(latest.derived.fatPercent).toFixed(1)
                        : null,
                }));

                setLatestAnthro({
                    toraceCm:       latest.toraceCm       ?? null,
                    spalleCm:       latest.spalleCm       ?? null,
                    bicipiteCm:     latest.bicipiteCm     ?? null,
                    ombelicoCm:     latest.ombelicoCm     ?? null,
                    quadricipiteCm: latest.quadricipiteCm ?? null,
                });

                setLatestSites({
                    chest:   latest.sites?.chest   ?? null,
                    abdomen: latest.sites?.abdomen ?? null,
                    thigh:   latest.sites?.thigh   ?? null,
                });

            } catch (e) {
                console.error("Errore caricamento misure:", e.message);
            }
        }

        loadMisure();
    }, [auth?.accessToken]);

    useEffect(() => {
        if (!auth?.accessToken) return;

        async function loadLastWorkout() {
            try {
                const data = await getLastWorkout(auth.accessToken);

                setSummary(prev => ({
                    ...prev,
                    lastWorkout: data
                }));

            } catch (e) {
                console.error("Errore last workout:", e.message);
            }
        }

        loadLastWorkout();
    }, [auth?.accessToken]);

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const smallBadge = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium";

    const fmt = (val, fallback = "—") =>
        val !== null && val !== undefined && val !== "" ? val : fallback;

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
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Peso attuale</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold">
                                        {summary.weightKg !== null ? `${summary.weightKg} kg` : "—"}
                                    </span>
                                    {deltaWeight !== null && (
                                        <span className={`${smallBadge} ${deltaWeight <= 0 ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-800"}`}>
                                            <TrendingUp className="h-3 w-3" />
                                            {deltaWeight > 0 ? `+${deltaWeight}` : `${deltaWeight}`} kg
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Scale className="h-5 w-5 text-gray-400" />
                        </div>
                        {weightTrend.length > 0 && (
                            <div className="mt-3 text-gray-500">
                                <Sparkline data={weightTrend} className="text-amber-600" />
                            </div>
                        )}
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">BMI</p>
                                <div className="mt-1 text-2xl font-semibold">{fmt(summary.bmi)}</div>
                                {summary.heightCm && (
                                    <p className="text-xs text-gray-500">Altezza: {summary.heightCm} cm</p>
                                )}
                            </div>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Massa grassa stimata</p>
                                <div className="mt-1 text-2xl font-semibold">
                                    {summary.fatPercent !== null ? `${summary.fatPercent}%` : "—"}
                                </div>
                                {sum3 !== null && (
                                    <p className="text-xs text-gray-500">Σ3: {sum3} mm</p>
                                )}
                            </div>
                            <HeartPulse className="h-5 w-5 text-gray-400" />
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
                            {summary.weekWorkoutsGoal !== null && (
                                <span className="text-sm text-gray-500">
                                    Questa settimana: {fmt(summary.weekWorkoutsDone, "0")}/{summary.weekWorkoutsGoal}
                                </span>
                            )}
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-1">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">Ultimo allenamento</p>
                                <p className="text-sm text-gray-600 mb-2">
                                    {summary.lastWorkout?.data
                                        ? new Date(summary.lastWorkout.data).toLocaleDateString("it-IT")
                                        : "—"}
                                </p>
                                {summary.lastWorkout?.giorni?.length > 0 ? (
                                    summary.lastWorkout.giorni.map((g, i) => (
                                        <div key={i} className="mt-2">
                                            <p className="text-sm font-medium">{g.giorno}</p>
                                            <p className="text-xs text-gray-500">
                                                {g.esercizi.map(e => e.nome).join(", ")}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="mt-1 text-sm text-gray-400">Nessun allenamento registrato</p>
                                )}
                            </div>
                        </div>
                        <Link to={`/cliente/allenamento?planId=${localStorage.getItem("latestPlanId")}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                            Apri allenamenti <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                            <Utensils className="h-5 w-5 text-gray-500" />
                            <h3 className="text-lg font-semibold">Piano alimentare</h3>
                        </div>
                        {summary.mealPlan.length > 0 ? (
                            <ul className="mt-4 space-y-3 text-sm">
                                {summary.mealPlan.map((meal, index) => (
                                    <li key={index} className="flex flex-col gap-0.5">
                                        <span className="font-medium text-gray-800">{meal.name}</span>
                                        <span className="text-xs text-gray-500 leading-snug">{meal.description}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-sm text-gray-400">Nessun piano alimentare disponibile.</p>
                        )}
                        <Link to={`/cliente/pianoalimentare`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                            Vedi piano completo <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className={`${baseCard} p-4`}>
                        <h3 className="border-b border-gray-200 pb-3 text-lg font-semibold">Ultime misure</h3>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                            {[
                                { label: "Torace", value: latestAnthro.toraceCm },
                                { label: "Spalle", value: latestAnthro.spalleCm },
                                { label: "Bicipite", value: latestAnthro.bicipiteCm },
                                { label: "Ombelico", value: latestAnthro.ombelicoCm },
                                { label: "Quadricipite", value: latestAnthro.quadricipiteCm },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-gray-500">{label}</p>
                                    <p className="text-lg font-semibold">
                                        {value !== null ? `${value} cm` : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${baseCard} p-4`}>
                        <h3 className="border-b border-gray-200 pb-3 text-lg font-semibold">Ultime pliche</h3>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            {[
                                { label: "Pettorale", value: latestSites.chest },
                                { label: "Addominale", value: latestSites.abdomen },
                                { label: "Coscia", value: latestSites.thigh },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                                    <p className="text-gray-500">{label}</p>
                                    <p className="text-lg font-semibold">
                                        {value !== null ? `${value} mm` : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Link to={`/cliente/misure`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                            Vai alle misure <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}