import React from "react";

export default function Card({ title, description }) {
    return (
        <div className="border border-black rounded-xl p-6 hover:bg-black hover:text-white transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-sm">{description}</p>
        </div>
    );
}