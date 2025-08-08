import { Routes, Route } from "react-router-dom";
import DashboardAdmin from "../pages/adminPages/Dashboard";
import GestioneClienti from "../pages/adminPages/GestioneClienti";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/clienti" element={<GestioneClienti />} />
            
        </Routes>
    );
}
