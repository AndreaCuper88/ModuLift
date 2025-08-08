import { Routes, Route } from "react-router-dom";
import DashboardAdmin from "../pages/adminPages/Dashboard";
import GestioneClienti from "../pages/adminPages/GestioneClienti";
import GestioneSchedaUtente from "../pages/adminPages/GestioneSchedaUtente";
import GestionePianoUtente from "../pages/adminPages/GestionePianoUtente";
import GestioneMisureCliente from "../pages/adminPages/GestioneMisureCliente";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/clienti" element={<GestioneClienti />} />
            <Route path="/admin/scheda/:id" element={<GestioneSchedaUtente />} />
            <Route path="/admin/piano/:id" element={<GestionePianoUtente />} />
            <Route path="/admin/misure/:id" element={<GestioneMisureCliente />} />

        </Routes>
    );
}
