import { Routes, Route } from "react-router-dom";
import DashboardCliente from "../pages/clientiPges/Dashboard";

export default function ClienteRoutes() {
    return (
        <Routes>
            <Route path="/cliente/dashboard" element={<DashboardCliente />} />

        </Routes>
    );
}
