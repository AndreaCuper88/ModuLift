import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Mail, Calendar, Ruler, Venus, Mars, ShieldCheck, Clock, Camera } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getProfilo, uploadAvatar  } from "../api/userApi";

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon className="h-4 w-4 text-gray-400" />
                {label}
            </div>
            <span className="text-sm font-medium text-gray-800">{value ?? "—"}</span>
        </div>
    );
}

function fmt(val, fallback = "—") {
    return val !== null && val !== undefined && val !== "" ? val : fallback;
}

function fmtDate(val) {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("it-IT", {
        day: "2-digit", month: "long", year: "numeric",
    });
}

function calcAge(dataNascita) {
    if (!dataNascita) return null;
    return Math.floor((Date.now() - new Date(dataNascita).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function Profilo() {
    const { id } = useParams();
    const { auth } = useAuth();
    const [profilo, setProfilo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Controllo se il profilo visualizzato è il mio
    const isOwner = auth?.user?.id === id;

    useEffect(() => {
        const fetchProfilo = async () => {
            try {
                const data = await getProfilo(id);
                console.log(data);
                setProfilo(data);
            } catch (e) {
                setError(e.response?.data?.message || "Utente non trovato");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfilo();
    }, [id]);

    const handleAvatarClick = () => {
        if (isOwner) fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview immediata
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);

        try {
            const data = await uploadAvatar(file);
            // Aggiorno il profilo con il nuovo avatarPath
            setProfilo(prev => ({ ...prev, avatarPath: data.avatarPath }));
        } catch (err) {
            console.error("Errore upload avatar:", err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin fill-amber-500" viewBox="0 0 100 101" fill="none">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        </div>
    );

    const age = calcAge(profilo?.dataNascita);
    const SessoIcon = profilo?.sesso === "F" ? Venus : Mars;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-amber-50 to-white text-gray-900">
            <div className="mx-auto max-w-2xl px-4 py-10">

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold md:text-3xl">Profilo</h1>
                    <p className="text-sm text-gray-500">Informazioni personali</p>
                </div>

                {/* Avatar + nome */}
                <div className="rounded-2xl border border-gray-300 bg-white p-6 mb-4">
                    <div className="flex items-center gap-5">

                        {/* Avatar */}
                        <div className="relative shrink-0 group">
                            <div
                                onClick={handleAvatarClick}
                                className={`flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-3xl font-bold text-white overflow-hidden transition ${
                                    isOwner ? "cursor-pointer" : "cursor-default"
                                }`}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                                ) : profilo?.avatarPath ? (
                                    <img src={`${process.env.REACT_APP_API_BASE_URL}/uploads/avatars/${profilo.avatarPath}`} alt="avatar" className="h-full w-full object-cover" />
                                ) : (
                                    profilo?.username?.charAt(0).toUpperCase() ?? "U"
                                )}
                            </div>

                            {/* Overlay fotocamera visibile solo se owner */}
                            {isOwner && (
                                <div
                                    onClick={handleAvatarClick}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            )}

                            {/* Input file nascosto */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div>
                            <p className="text-xl font-semibold text-gray-900">
                                {fmt(profilo?.nome)} {fmt(profilo?.cognome)}
                            </p>
                            <p className="text-sm text-gray-500">@{fmt(profilo?.username)}</p>
                            <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                profilo?.ruolo === "admin"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                            }`}>
                                <ShieldCheck className="h-3 w-3" />
                                {profilo?.ruolo === "admin" ? "Amministratore" : "Cliente"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dati anagrafici */}
                <div className="rounded-2xl border border-gray-300 bg-white p-5 mb-4">
                    <h2 className="mb-4 text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">
                        Dati anagrafici
                    </h2>
                    <div className="space-y-2">
                        <InfoRow icon={Mail}      label="Email"           value={fmt(profilo?.email)} />
                        <InfoRow icon={User}      label="Username"        value={fmt(profilo?.username)} />
                        <InfoRow icon={Calendar}  label="Data di nascita" value={fmtDate(profilo?.dataNascita)} />
                        <InfoRow icon={Calendar}  label="Età"             value={age !== null ? `${age} anni` : "—"} />
                        <InfoRow icon={SessoIcon} label="Sesso"           value={fmt(profilo?.sesso)} />
                        <InfoRow icon={Ruler}     label="Altezza"         value={profilo?.altezza ? `${profilo.altezza} cm` : "—"} />
                    </div>
                </div>

                {/* Account */}
                <div className="rounded-2xl border border-gray-300 bg-white p-5">
                    <h2 className="mb-4 text-base font-semibold text-gray-700 border-b border-gray-200 pb-2">
                        Account
                    </h2>
                    <div className="space-y-2">
                        <InfoRow icon={Clock}       label="Registrato il"  value={fmtDate(profilo?.dataRegistrazione)} />
                        <InfoRow icon={ShieldCheck} label="Stato account"  value={profilo?.attivo ? "Attivo" : "Disattivo"} />
                    </div>
                </div>

            </div>
        </div>
    );
}