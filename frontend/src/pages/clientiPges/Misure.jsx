import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import UserCard from "../../components/UserCard";
import useAuth from "../../hooks/useAuth";
import { getMisure, getAltezza } from "../../api/clienteApi/misureApi";

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const ANTHRO_FIELDS = [
    { key: "pesoKg",          label: "Peso (kg)" },
    { key: "toraceCm",        label: "Torace (cm)" },
    { key: "spalleCm",        label: "Spalle (cm)" },
    { key: "bicipiteCm",      label: "Bicipite (cm)" },
    { key: "ombelicoCm",      label: "Ombelico (cm)" },
    { key: "quadricipiteCm",  label: "Quadricipite (cm)" },
];

const SITES_MALE   = ["chest", "abdomen", "thigh"];
const SITES_FEMALE = ["triceps", "suprailiac", "thigh"];

const SITE_LABELS = {
    chest:      "Pettorale (mm)",
    abdomen:    "Addominale (mm)",
    thigh:      "Coscia (mm)",
    triceps:    "Tricipite (mm)",
    suprailiac: "Sovrailiaca (mm)",
};

function getSiteKeys(misure) {
    if (!misure.length) return SITES_MALE;
    const sex = misure[0].sex;
    return sex === "female" ? SITES_FEMALE : SITES_MALE;
}

function readSite(misura, key) {
    const sites = misura.sites;
    if (!sites) return null;
    if (typeof sites.get === "function") return sites.get(key) ?? null;
    return sites[key] ?? null;
}

const fmt = (val) => (val !== null && val !== undefined ? val : "—");

export default function MisureCliente() {
    const { auth } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [misure, setMisure]   = useState([]);
    const [altezza, setAltezza] = useState("");
    const [eta, setEta]         = useState("");

    async function caricaMisure() {
        console.log(auth)
        try {
            setLoading(true);
            setError(null);
            const [data, utente] = await Promise.all([
                getMisure(auth?.accessToken),
                getAltezza(auth?.user?.id, auth?.accessToken)
            ])
            //console.log(data);
            setMisure(data ?? []);
            if (data?.length) {
                setEta(data[0].ageAtMeasure ?? "");
            }
            setAltezza(utente ?? "");
        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        caricaMisure();
    }, [auth?.accessToken]);

    const siteKeys = getSiteKeys(misure);

    const baseCard = "rounded-2xl border border-gray-300 bg-white text-gray-900";
    const baseBtn  = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-gray-800 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 transition disabled:opacity-60";
    const cellCls  = "px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800 min-w-[110px]";
    const headCls  = "px-3 py-2 text-sm font-medium text-gray-500 min-w-[110px]";
    const labelCls = "px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap sticky left-0 bg-white z-10";

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-5xl px-4 py-8">

                <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <UserCard idUtente={auth.user?.id} />
                        <h1 className="mt-4 text-2xl font-semibold md:text-3xl">Misure cliente</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={caricaMisure} className={baseBtn} disabled={loading}>
                            <RefreshCw className="h-4 w-4" />
                            {loading ? "Aggiorno..." : "Aggiorna"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {/* Antropometria */}
                <div className={`${baseCard} p-5 mb-4`}>
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Antropometria (cm / kg)</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Righe = misure; Colonne = date. Scorri orizzontalmente se necessario.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Altezza (cm)</span>
                            <span className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-800 bg-gray-50">
                                {altezza || "—"}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="border-separate border-spacing-1 min-w-max">
                            <thead>
                            <tr>
                                <th className={`${labelCls} font-semibold`}>Misura</th>
                                {misure.map((m) => (
                                    <th key={m._id} className={headCls}>
                                        {formatDate(m.measuredAt)}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {ANTHRO_FIELDS.map(({ key, label }) => (
                                <tr key={key}>
                                    <td className={labelCls}>{label}</td>
                                    {misure.map((m) => (
                                        <td key={m._id}>
                                            <div className={cellCls}>{fmt(m[key])}</div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Plicometria */}
                <div className={`${baseCard} p-5`}>
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Plicometria – 3 pliche (mm)</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Protocollo: {siteKeys.map((k) => SITE_LABELS[k].split(" ")[0]).join(", ")}. Include stima % massa grassa.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Età</span>
                            <span className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-800 bg-gray-50">
                                {eta || "—"}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="border-separate border-spacing-1 min-w-max">
                            <thead>
                            <tr>
                                <th className={`${labelCls} font-semibold`}>Plica</th>
                                {misure.map((m) => (
                                    <th key={m._id} className={headCls}>
                                        {formatDate(m.measuredAt)}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {siteKeys.map((siteKey) => (
                                <tr key={siteKey}>
                                    <td className={labelCls}>{SITE_LABELS[siteKey]}</td>
                                    {misure.map((m) => (
                                        <td key={m._id}>
                                            <div className={cellCls}>{fmt(readSite(m, siteKey))}</div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className={labelCls}>Stima massa grassa (%)</td>
                                {misure.map((m) => (
                                    <td key={m._id}>
                                        <div className={`${cellCls} bg-amber-50 font-medium`}>
                                            {m.derived?.fatPercent != null
                                                ? Number(m.derived.fatPercent).toFixed(1)
                                                : "—"}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}