import { FaUsers, FaDumbbell, FaUtensils } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getClienti, getCountPiani, getCountSchede, getCountPianiAlimentari } from "../../api/adminApi/dashboardAdminApi";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";

const cardConfig = [
    {
        titolo: 'Utenti Attivi',
        key: 'utentiAttivi',
        Icona: FaUsers,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50',
    },
    {
        titolo: 'Schede Allenamento',
        key: 'schedeAllenamento',
        Icona: FaDumbbell,
        iconColor: 'text-green-500',
        iconBg: 'bg-green-50',
    },
    {
        titolo: 'Piani Alimentari',
        key: 'pianiAlimentari',
        Icona: FaUtensils,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
    }
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-md text-sm">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className="text-blue-500 font-bold">{payload[0].value} schede</p>
            </div>
        );
    }
    return null;
};

export default function DashboardAdmin() {
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const nomiGiorni = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
    const [graficoSchede, setGraficoSchede] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth?.accessToken) return;
            try {
                setLoading(true);
                const [userCount, schedeCount, pianiCount, countPiani] = await Promise.all([
                    getClienti(auth.accessToken),
                    getCountSchede(auth.accessToken),
                    getCountPianiAlimentari(auth.accessToken),
                    getCountPiani(auth.accessToken)
                ]);
                setData({ utentiAttivi: userCount, schedeAllenamento: schedeCount, pianiAlimentari: pianiCount });
                setGraficoSchede(nomiGiorni.map((giorno, i) => ({ giorno, valore: countPiani[i] ?? 0 })));
            } catch (err) {
                console.error("Errore nel caricamento dei dati:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [auth]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-6xl px-4 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold md:text-3xl">Dashboard Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Panoramica generale della piattaforma</p>
                </div>

                {/* Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {cardConfig.map(({ titolo, key, Icona, iconColor, iconBg }) => (
                        <div
                            key={key}
                            className="rounded-2xl border border-gray-300 bg-white p-4 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-sm text-gray-500">{titolo}</p>
                                {loading ? (
                                    <div className="mt-2 h-8 w-16 rounded-xl bg-gray-200 animate-pulse" />
                                ) : (
                                    <p className="mt-1 text-2xl font-semibold">
                                        {data[key] ?? '—'}
                                    </p>
                                )}
                            </div>
                            <div className={`p-3 rounded-2xl ${iconBg}`}>
                                <Icona className={`text-xl ${iconColor}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grafico */}
                <div className="rounded-2xl border border-gray-300 bg-white p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Schede create questa settimana</h2>
                    <p className="text-sm text-gray-500 mt-0.5 mb-4">Distribuzione giornaliera</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={graficoSchede} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="giorno" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#9ca3af' }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#9ca3af' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251,191,36,0.08)' }} />
                            <Bar dataKey="valore" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}