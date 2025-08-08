import { FaUsers, FaDumbbell, FaUtensils } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardAdmin() {
    // Dati statici finti
    const data = {
        utentiAttivi: 124,
        schedeAllenamento: 89,
        pianiAlimentari: 67
    };

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

    // Dati finti per il grafico (schede negli ultimi 7 giorni)
    const graficoSchede = [
        { giorno: 'Lun', valore: 4 },
        { giorno: 'Mar', valore: 6 },
        { giorno: 'Mer', valore: 2 },
        { giorno: 'Gio', valore: 5 },
        { giorno: 'Ven', valore: 7 },
        { giorno: 'Sab', valore: 1 },
        { giorno: 'Dom', valore: 3 }
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
                            <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
                                {card.valore}
                            </p>
                        </div>
                        {card.icona}
                    </div>
                ))}
            </div>

            {/* Sezione Grafico */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Schede create negli ultimi 7 giorni</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graficoSchede} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="giorno" stroke="#888" />
                        <YAxis allowDecimals={false} stroke="#888" />
                        <Tooltip />
                        <Bar dataKey="valore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
