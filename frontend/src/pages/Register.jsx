import React, { useState } from 'react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        username: '',
        dataNascita: '',
        sesso: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData); //Per test
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4">
            <div className="bg-white text-black w-full max-w-md rounded-2xl shadow-2xl p-8 mt-6 mb-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Registrazione</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Nome</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Cognome</label>
                        <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required minLength={6} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Data di nascita</label>
                        <input type="date" name="dataNascita" value={formData.dataNascita} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block mb-1">Sesso</label>
                        <select name="sesso" value={formData.sesso} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                            <option value="">Seleziona</option>
                            <option value="M">Maschio</option>
                            <option value="F">Femmina</option>
                            <option value="Altro">Altro</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">
                        Registrati
                    </button>
                </form>
            </div>
        </div>
    );
}
