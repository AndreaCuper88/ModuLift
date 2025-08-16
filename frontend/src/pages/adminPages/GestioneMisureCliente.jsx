import React, {useCallback, useEffect, useState} from "react";
import { Plus, Save, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import UserCard from "../../components/UserCard";

import {getEntriesByUser, getUserAge, getUserSex, upsertMisure} from "../../api/misureApi";
import useAuth from "../../hooks/useAuth";

const { estimateBfJP3 } = require('../../utils/estimateBodyFat');

// ------------------------------------------------------
// ModuLift – Misure Cliente (stile chiaro, 2 tabelle, date modificabili solo nella prima, stima BF%)
// Rappresentazione dati allineata allo schema MisuraPliche: array di record per data
// ------------------------------------------------------

export default function ClientMeasurements({setAlert}) {
    const { id } = useParams();
    const [age, setAge] = useState(null);
    const [sex, setSex] = useState("");
    const { auth } = useAuth();
    const [loadingAge, setLoadingAge] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingEntries, setLoadingEntries] = useState(false);

    const [entries, setEntries] = useState([]);

    const loadEntries = useCallback(async () => {
        if (!id) return;
        try {
            setLoadingEntries(true);
            const data = await getEntriesByUser(id, auth.accessToken);
            setEntries(Array.isArray(data) ? data : []);
            // opzionale:
            // setAlert({ message: "Misure caricate", type: "success" });
        } catch (e) {
            setAlert({ message: e.message || "Errore caricamento misure", type: "danger" });
            setEntries([]);
        } finally {
            setLoadingEntries(false);
        }
    }, [id, auth.accessToken, setEntries, setAlert, setLoadingEntries]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition";
    const cellInput = "w-full rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none";
    const stickyHead = "sticky left-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60";
    const headDateInput = "w-36 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-900 outline-none";

    const dates = entries.map((e) => e.measuredAt);

    const addDateColumn = () => {
        const iso = new Date().toISOString().slice(0, 10);
        const newDate = dates.includes(iso) ? `${iso}` : iso;
        const newEntry = {
            user: id,
            measuredAt: newDate,
            method: "JP3",
            ageAtMeasure: age ?? null,
            sites: {},
            pesoKg: undefined,
            toraceCm: undefined,
            spalleCm: undefined,
            bicipiteCm: undefined,
            ombelicoCm: undefined,
            quadricipiteCm: undefined,
        };
        setEntries((prev) => [...prev, newEntry]);
    };

    const renameDate = (index, newDate) => {
        const oldDate = dates[index];
        if (!newDate || newDate === oldDate) return;
        setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, measuredAt: newDate } : e)));
    };

    const num = (x) => {
        const v = parseFloat((x ?? "").toString().replace(",", "."));
        return Number.isFinite(v) ? v : undefined;
    };

    const METRIC_FIELD = {
        peso: "pesoKg",
        torace: "toraceCm",
        spalle: "spalleCm",
        bicipite: "bicipiteCm",
        ombelico: "ombelicoCm",
        quadricipite: "quadricipiteCm",
    };

    const SKIN_ROWS = sex === "female"
        ? [
            { key: "tricipite", label: "Tricipite (mm)" },
            { key: "sovrailiaca", label: "Sovrailiaca (mm)" },
            { key: "coscia", label: "Coscia (mm)" },
        ]
        : [
            { key: "pettorale", label: "Pettorale (mm)" },
            { key: "addominale", label: "Addominale (mm)" },
            { key: "coscia", label: "Coscia (mm)" },
        ];

    const SKIN_FIELD = sex === "female"
        ? { tricipite: "triceps", sovrailiaca: "suprailiac", coscia: "thigh" }
        : { pettorale: "chest", addominale: "abdomen", coscia: "thigh" };

    const setMetricVal = (rowKey, date, val) => {
        const field = METRIC_FIELD[rowKey];
        if (!field) return;
        setEntries((rows) =>
            rows.map((e) => (e.measuredAt === date ? { ...e, [field]: num(val) } : e))
        );
    };

    const setSkinfoldVal = (rowKey, date, val) => {
        const site = SKIN_FIELD[rowKey];
        if (!site) return;
        setEntries((rows) =>
            rows.map((e) =>
                e.measuredAt === date
                    ? { ...e, sites: { ...(e.sites || {}), [site]: num(val) } }
                    : e
            )
        );
    };

    const getEntryByDate = (d) => entries.find((e) => e.measuredAt === d);

    const estimateBF = (date) => {
        const entry = getEntryByDate(date);
        if (!entry) return "";

        // età da usare: priorità a quella “snapshot” della misura, altrimenti la corrente
        const ageUse = Number(entry?.ageAtMeasure ?? age ?? 0);

        const res = estimateBfJP3({
            sex,                         // "male" | "female"
            sites: entry?.sites || {},   // object con le pliche
            ageYears: ageUse,            // anni alla data della misura
            decimals: 1,                 // una cifra decimale
        });

        if (!res.isComplete || !Number.isFinite(res.fatPercent)) return "";

        // Clamp: limito il valore in un intervallo, per evitare valori assurdi
        const clamped = Math.max(0, Math.min(60, res.fatPercent));
        return clamped.toFixed(1);     // oppure semplicemente: String(res.fatPercent)
    };

    const metrics = [
        { key: "peso", label: "Peso (kg)" },
        { key: "torace", label: "Torace (cm)" },
        { key: "spalle", label: "Spalle (cm)" },
        { key: "bicipite", label: "Bicipite (cm)" },
        { key: "ombelico", label: "Ombelico (cm)" },
        { key: "quadricipite", label: "Quadricipite (cm)" },
    ].map((row) => ({
        ...row,
        values: Object.fromEntries(
            entries.map((e) => [e.measuredAt, e[METRIC_FIELD[row.key]] ?? ""])
        ),
    }));

    const skinfolds = SKIN_ROWS.map((row) => ({
        ...row,
        values: Object.fromEntries(
            entries.map((e) => [e.measuredAt, e?.sites?.[SKIN_FIELD[row.key]] ?? ""])
        ),
    }));

    const skinfoldsWithBF = [
        ...skinfolds,
        {
            key: "stima_bf",
            label: "Stima massa grassa (%)",
            values: Object.fromEntries(entries.map((e) => [e.measuredAt, estimateBF(e.measuredAt)])),
            readOnly: true,
        },
    ];

    async function loadAge() {
        try {
            setLoadingAge(true);
            const data = await getUserAge(id, undefined, auth.accessToken);
            setAge(data.age);
            setEntries((prev) => prev.map((e) => ({ ...e, ageAtMeasure: data.age })));
        } catch (e) {
            setAlert({ message: e.message, type: "danger" });
            console.error(e);
        } finally {
            setLoadingAge(false);
        }
    }

    async function loadSex() {
        try {
            const data = await getUserSex(id, auth.accessToken);
            setSex(data.sex);
        } catch (e) {
            setAlert({ message: e.message, type: "danger" });
            console.error(e);
        }
    }

    useEffect(() => {
        if (!id) {
            setAlert({ message: "Id utente mancante", type: "danger" });
        }
        loadAge();
        loadSex();
    }, [id, auth.accessToken]);

    const saveAll = async () => {
        const payload = entries.map((e) => ({ ...e, sex }));
        console.log("Salva misure:", payload);
        try {
            setLoadingSave(true);
            const out = await upsertMisure(payload, auth.accessToken);
            setAlert({ message: out?.message ?? "Misure salvate", type: "success" });
        } catch (e) {
            setAlert({ message: e.message, type: "danger" });
        } finally {
            setLoadingSave(false);
        }
    };

    const refreshAll = () => {
        loadEntries();
    };

    const protocolLabel = sex === "female" ? "Tricipite, Sovrailiaca, Coscia" : "Pettorale, Addominale, Coscia";

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
                        {loadingSave ? (
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
                            <button onClick={saveAll} className={baseBtn}>
                                <Save className="h-4 w-4"/> Salva
                            </button>
                        )}
                    </div>
                </div>

                <div className={`${baseCard} mb-6`}>
                    <div className="border-b border-gray-300 px-4 py-3">
                        <h2 className="text-lg font-semibold">Antropometria (cm / kg)</h2>
                        <p className="text-sm text-gray-500">Righe = misure; Colonne = date. Scorri orizzontalmente se
                            necessario.</p>
                    </div>
                    <div className="overflow-x-auto p-4">
                    {loadingEntries ? (
                        <div role="status">
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>

                    ) : (
                        <>
                            <table className="min-w-[900px] border-separate border-spacing-0">
                                <thead>
                                <tr>
                                    <th className={`w-56 px-3 py-2 text-left text-sm font-medium ${stickyHead} border-r border-gray-200`}>Misura</th>
                                    {dates.map((d, i) => (
                                        <th key={`h-${d}-${i}`}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200">
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
                        </>
                    )}
                    </div>
                </div>

                <div className={`${baseCard}`}>
                    <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
                        <div>
                            <h2 className="text-lg font-semibold">Plicometria – 3 pliche (mm)</h2>
                            <p className="text-sm text-gray-500">Protocollo: {protocolLabel}. Include stima % massa grassa.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <label className="text-gray-600">Età</label>
                            {loadingAge ? (
                                <div role="status">
                                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>

                            ) : (
                                <input
                                    type="number"
                                    value={age ?? ''}
                                    readOnly
                                    className="w-20 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-900 outline-none cursor-not-allowed"
                                />
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto p-4">
                        {loadingEntries ? (
                            <div role="status">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>

                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}