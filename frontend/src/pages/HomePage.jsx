import React from "react";
import backgroundImage from "../assets/Bg_Home.png"; // immagine sfumata a destra
import Card from "../components/SimpleCard";


export default function HomePage() {
    return (
        <div className="relative bg-white min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-right opacity-90"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    maskImage: 'linear-gradient(to left, black 50%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent)',
                }}
            ></div>

            <div className="relative z-10 px-6 py-20 flex flex-col lg:flex-row items-left">
                <div className="w-full md:w-1/2 text-left">
                    <h1 className="text-5xl font-extrabold text-black mb-4">
                        Benvenuto su <br />
                        <span className="underline decoration-black">ModuLift</span>
                    </h1>
                    <p className="text-gray-700 text-lg mb-8">
                        Ottimizza il tuo allenamento e la tua alimentazione con una piattaforma su misura. Tutto in un unico posto.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card title="Schede Allenamento" description="Crea e monitora i tuoi workout." icon="📋" />
                        <Card title="Piani Alimentari" description="Consulta e genera piani nutrizionali." icon="🍎" />
                        <Card
                            title="Progressi"
                            description="Visualizza i tuoi risultati nel tempo."
                            icon="📈"
                            cta={{ label: "Inizia ora", link: "#" }}
                        />
                    </div>
                </div>
            </div>
        </div>

    );
}
