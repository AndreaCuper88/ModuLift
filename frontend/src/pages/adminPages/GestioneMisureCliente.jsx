import React, {useEffect, useState} from "react";
import { Plus, Save, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import UserCard from "../../components/UserCard";

import { getUserAge } from "../../api/misureApi";
import useAuth from "../../hooks/useAuth";

// ------------------------------------------------------
// ModuLift – Misure Cliente (stile chiaro, 2 tabelle, date modificabili solo nella prima, stima BF%)
// ------------------------------------------------------

export default function ClientMeasurements({setAlert}) {
    const { id } = useParams();
    const [age, setAge] = useState(null);
    const { auth } = useAuth();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const [loadingAge, setLoadingAge] = useState(false);

    const [dates, setDates] = useState([
        "2025-08-01",
        "2025-08-08",
        "2025-08-15",
        "2025-08-22",
    ]);

    const [metrics, setMetrics] = useState([
        { key: "peso", label: "Peso (kg)", values: { "2025-08-01": 80.0, "2025-08-08": 79.4, "2025-08-15": 79.0, "2025-08-22": 78.6 } },
        { key: "torace", label: "Torace (cm)", values: { "2025-08-01": 102, "2025-08-08": 101.5, "2025-08-15": 101, "2025-08-22": 100.8 } },
        { key: "spalle", label: "Spalle (cm)", values: { "2025-08-01": 122, "2025-08-08": 121.8, "2025-08-15": 121.5, "2025-08-22": 121.3 } },
        { key: "bicipite", label: "Bicipite (cm)", values: { "2025-08-01": 36.5, "2025-08-08": 36.6, "2025-08-15": 36.7, "2025-08-22": 36.7 } },
        { key: "ombelico", label: "Ombelico (cm)", values: { "2025-08-01": 92, "2025-08-08": 91.2, "2025-08-15": 90.7, "2025-08-22": 90.0 } },
        { key: "quadricipite", label: "Quadricipite (cm)", values: { "2025-08-01": 58, "2025-08-08": 58.1, "2025-08-15": 58.2, "2025-08-22": 58.3 } },
    ]);

    const [skinfolds, setSkinfolds] = useState([
        { key: "pettorale", label: "Pettorale (mm)", values: { "2025-08-01": 12, "2025-08-08": 11, "2025-08-15": 11, "2025-08-22": 10 } },
        { key: "addominale", label: "Addominale (mm)", values: { "2025-08-01": 20, "2025-08-08": 19, "2025-08-15": 18, "2025-08-22": 17 } },
        { key: "coscia", label: "Coscia (mm)", values: { "2025-08-01": 16, "2025-08-08": 15, "2025-08-15": 15, "2025-08-22": 14 } },
    ]);

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition";
    const cellInput = "w-full rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none";
    const stickyHead = "sticky left-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60";
    const headDateInput = "w-36 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-900 outline-none";

    const addDateColumn = () => {
        const iso = new Date().toISOString().slice(0, 10);
        const newDate = dates.includes(iso) ? `${iso}` : iso;
        setDates((d) => [...d, newDate]);
        setMetrics((rows) => rows.map((r) => ({ ...r, values: { ...r.values, [newDate]: "" } })));
        setSkinfolds((rows) => rows.map((r) => ({ ...r, values: { ...r.values, [newDate]: "" } })));
    };

    const renameDate = (index, newDate) => {
        const oldDate = dates[index];
        if (!newDate || newDate === oldDate) return;
        setDates((prev) => {
            const copy = [...prev];
            copy[index] = newDate;
            return copy;
        });
        setMetrics((rows) => rows.map((r) => {
            const v = r.values?.[oldDate];
            if (v === undefined) return r;
            const values = { ...r.values };
            delete values[oldDate];
            if (values[newDate] === undefined) values[newDate] = v;
            return { ...r, values };
        }));
        setSkinfolds((rows) => rows.map((r) => {
            const v = r.values?.[oldDate];
            if (v === undefined) return r;
            const values = { ...r.values };
            delete values[oldDate];
            if (values[newDate] === undefined) values[newDate] = v;
            return { ...r, values };
        }));
    };

    const setMetricVal = (rowKey, date, val) =>
        setMetrics((rows) => rows.map((r) => (r.key === rowKey ? { ...r, values: { ...r.values, [date]: val } } : r)));

    const setSkinfoldVal = (rowKey, date, val) =>
        setSkinfolds((rows) => rows.map((r) => (r.key === rowKey ? { ...r, values: { ...r.values, [date]: val } } : r)));

    const estimateBF = (date) => {
        const getVal = (k) => parseFloat((skinfolds.find((r) => r.key === k)?.values?.[date] ?? "").toString().replace(",", "."));
        const chest = getVal("pettorale");
        const abdomen = getVal("addominale");
        const thigh = getVal("coscia");
        if (![chest, abdomen, thigh].every((v) => Number.isFinite(v))) return "";
        const S = chest + abdomen + thigh;
        const Db = 1.10938 - 0.0008267 * S + 0.0000016 * S * S - 0.0002574 * (parseFloat(age) || 0);
        if (!Number.isFinite(Db) || Db <= 0) return "";
        const bf = 495 / Db - 450;
        const v = Math.max(0, Math.min(60, bf));
        return v.toFixed(1);
    };

    const skinfoldsWithBF = [
        ...skinfolds,
        { key: "stima_bf", label: "Stima massa grassa (%)", values: Object.fromEntries(dates.map((d) => [d, estimateBF(d)])), readOnly: true },
    ];

    //Gestione chiamate API

    async function loadAge() {
        try {
            setLoadingAge(true);
            const data = await getUserAge(id, /* at opzionale */ undefined, auth.accessToken);
            setAge(data.age);
        } catch (e) {
            setAlert({ message: e.message, type: "danger" });
            console.error(e);
        } finally {
            setLoadingAge(false);
        }
    }
    useEffect(() => {
        if (!id) {
            setAlert({ message: "Id utente mancante", type: "danger" });
        }
        loadAge();
    }, [id, auth.accessToken]);


    const saveAll = () => {
        const payload = {
            dates,
            metrics,
            skinfolds,
            bfEstimate: Object.fromEntries(dates.map((d) => [d, estimateBF(d)])),
        };
        console.log("Salva misure:", payload);
    };

    const refreshAll = () => {
        console.log("Aggiorna misure (placeholder GET)");
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <UserCard idUtente={id} />
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold md:text-3xl">Misure cliente</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={refreshAll} className={baseBtn}>
                            <RefreshCw className="h-4 w-4" /> Aggiorna
                        </button>
                        <button onClick={addDateColumn} className={baseBtn}>
                            <Plus className="h-4 w-4" /> Aggiungi rilevazione (oggi)
                        </button>
                        <button onClick={saveAll} className={baseBtn}>
                            <Save className="h-4 w-4" /> Salva
                        </button>
                    </div>
                </div>

                {/* Tabella 1: date modificabili */}
                <div className={`${baseCard} mb-6`}>
                    <div className="border-b border-gray-300 px-4 py-3">
                        <h2 className="text-lg font-semibold">Antropometria (cm / kg)</h2>
                        <p className="text-sm text-gray-500">Righe = misure; Colonne = date. Scorri orizzontalmente se necessario.</p>
                    </div>
                    <div className="overflow-x-auto p-4">
                        <table className="min-w-[900px] border-separate border-spacing-0">
                            <thead>
                            <tr>
                                <th className={`w-56 px-3 py-2 text-left text-sm font-medium ${stickyHead} border-r border-gray-200`}>Misura</th>
                                {dates.map((d, i) => (
                                    <th key={`h-${d}-${i}`} className="px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200">
                                        <input type="date" value={d} onChange={(e) => renameDate(i, e.target.value)} className={headDateInput} />
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {metrics.map((row) => (
                                <tr key={row.key}>
                                    <td className={`px-3 py-2 text-sm font-medium ${stickyHead} border-r border-gray-200`}>{row.label}</td>
                                    {dates.map((d) => (
                                        <td key={`${row.key}-${d}`} className="px-3 py-2 align-middle border-r border-gray-200">
                                            <input
                                                className={cellInput}
                                                value={row.values[d] ?? ""}
                                                onChange={(e) => setMetricVal(row.key, d, e.target.value)}
                                                placeholder=""
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabella 2: date solo visualizzate (niente input) */}
                <div className={`${baseCard}`}>
                    <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
                        <div>
                            <h2 className="text-lg font-semibold">Plicometria – 3 pliche (mm)</h2>
                            <p className="text-sm text-gray-500">Protocollo: Pettorale, Addominale, Coscia. Include stima % massa grassa.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <label className="text-gray-600">Età</label>
                            <input
                                type="number"
                                value={age ?? ''}        // valorizzato dal backend
                                readOnly                 // ← non modificabile
                                className="w-20 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-900 outline-none cursor-not-allowed"
                            />
                        </div>

                    </div>
                    <div className="overflow-x-auto p-4">
                        <table className="min-w-[900px] border-separate border-spacing-0">
                            <thead>
                            <tr>
                                <th className={`w-56 px-3 py-2 text-left text-sm font-medium ${stickyHead} border-r border-gray-200`}>Plica</th>
                                {dates.map((d, i) => (
                                    <th key={`hs-${d}-${i}`} className="px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200">{d}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {skinfoldsWithBF.map((row) => (
                                <tr key={row.key}>
                                    <td className={`px-3 py-2 text-sm font-medium ${stickyHead} border-r border-gray-200`}>{row.label}</td>
                                    {dates.map((d) => (
                                        <td key={`${row.key}-${d}`} className="px-3 py-2 align-middle border-r border-gray-200">
                                            <input
                                                className={`${cellInput} ${row.readOnly ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
                                                value={row.values[d] ?? ""}
                                                onChange={(e) => !row.readOnly && setSkinfoldVal(row.key, d, e.target.value)}
                                                readOnly={!!row.readOnly}
                                                placeholder=""
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}