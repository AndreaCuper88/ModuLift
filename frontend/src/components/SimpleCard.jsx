import React from "react";

export default function Card({ title, description, icon, cta }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 items-start">
            <div className="text-3xl">{icon}</div>
            <h3 className="text-xl font-bold text-black">{title}</h3>
            <p className="text-gray-600">{description}</p>
            {cta && (
                <a
                    href={cta.link}
                    className="mt-auto bg-black text-white font-semibold px-4 py-2 rounded hover:bg-gray-800"
                >
                    {cta.label}
                </a>
            )}
        </div>
    );
}
