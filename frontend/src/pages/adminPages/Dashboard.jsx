import { FaUsers, FaDumbbell, FaUtensils } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import {getClienti, getCountPiani} from "../../api/adminApi/dashboardAdminApi";
import useAuth from "../../hooks/useAuth";
import {useEffect, useState} from "react";

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
                const userCount = await getClienti(auth.accessToken);
                setData({
                    utentiAttivi: userCount,
                    schedeAllenamento: 89,
                    pianiAlimentari: 67
                });
                const countPiani = await getCountPiani(auth.accessToken);
                // Trasformo l'array di numeri in array di oggetti { giorno, valore }
                const dati = nomiGiorni.map((giorno, i) => ({
                    giorno,
                    valore: countPiani[i] ?? 0 //Se il valore viene null o undefined lo setto a zero
                }));
                setGraficoSchede(dati);
            } catch (err) {
                console.error("Errore nel caricamento dei clienti:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [auth]);


    const cardData = [
        {
            titolo: 'Utenti Attivi',
            valore: data.utentiAttivi,
            icona: <FaUsers className="text-4xl text-blue-500" />
        },
        {
            titolo: 'Schede Allenamento',
            valore: data.schedeAllenamento,
            icona: <FaDumbbell className="text-4xl text-green-500" />
        },
        {
            titolo: 'Piani Alimentari',
            valore: data.pianiAlimentari,
            icona: <FaUtensils className="text-4xl text-orange-500" />
        }
    ];


    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">Dashboard Admin</h1>

            {/* Sezione Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-800 shadow-md rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {card.titolo}
                            </h2>
                            {loading ? (
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
                            ) : (
                                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
                                    {card.valore}
                                </p>
                            )}
                        </div>
                        {card.icona}
                    </div>
                ))}
            </div>

            {/* Sezione Grafico */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Schede create negli ultimi 7
                    giorni</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graficoSchede} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="giorno" stroke="#888"/>
                        <YAxis allowDecimals={false} stroke="#888"/>
                        <Tooltip/>
                        <Bar dataKey="valore" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
