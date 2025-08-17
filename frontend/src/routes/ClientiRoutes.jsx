import { Routes, Route } from "react-router-dom";
import DashboardCliente from "../pages/clientiPges/Dashboard";
import Allenamento from "../pages/clientiPges/Allenamento";

export default function ClienteRoutes({setAlert}) {
    return (
        <Routes>
            <Route path="/cliente/dashboard" element={<DashboardCliente />} />
            <Route path="/cliente/allenamento" element={<Allenamento setAlert={setAlert}/>} />
        </Routes>
    );
}
