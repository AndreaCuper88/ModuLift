import React from 'react';
import Card from '../components/SimpleCard';

export default function HomePage() {
    return (
        <div className="bg-white min-h-screen px-6 py-12">
            <div className="max-w-5xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-black mb-6">Benvenuto su <span className="underline decoration-black">ModuLift</span></h1>
                <p className="text-gray-700 text-lg mb-12">
                    La tua piattaforma intelligente per allenamento e alimentazione personalizzati.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card title="Schede Allenamento" description="Crea e monitora i tuoi workout." />
                    <Card title="Piani Alimentari" description="Consulta e genera piani nutrizionali." />
                    <Card title="Progressi" description="Visualizza i tuoi risultati nel tempo." />
                </div>
            </div>
        </div>
    );
}
