import {Routes, Route, Navigate} from "react-router-dom";
import DashboardAdmin from "../pages/adminPages/Dashboard";
import GestioneClienti from "../pages/adminPages/GestioneClienti";
import GestioneSchedaUtente from "../pages/adminPages/GestioneSchedaUtente";
import GestionePianoUtente from "../pages/adminPages/GestionePianoUtente";
import GestioneMisureCliente from "../pages/adminPages/GestioneMisureCliente";

import useAuth from "../hooks/useAuth";

function AdminGuard({children}) {
    const {auth} = useAuth();
    if (!auth?.user) return <Navigate to="/" replace/>
    if(auth.user.ruolo !== "admin"){
        return <Navigate to="/" replace/>
    }
    return children;
}

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/admin/dashboard" element={
                <AdminGuard>
                    <DashboardAdmin />
                </AdminGuard>
            } />
            <Route path="/admin/clienti" element={
                <AdminGuard>
                    <GestioneClienti />
                </AdminGuard>
            } />
            <Route path="/admin/scheda/:id" element={
                <AdminGuard>
                    <GestioneSchedaUtente />
                </AdminGuard>
            } />
            <Route path="/admin/piano/:id" element={
                <AdminGuard>
                    <GestionePianoUtente />
                </AdminGuard>
            } />
            <Route path="/admin/misure/:id" element={
                <AdminGuard>
                    <GestioneMisureCliente />
                </AdminGuard>
            } />
        </Routes>
    );
}
