import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/Register";
import Profilo from "../pages/Profilo";

//Import di eventuali redirect
import DashboardRedirect from "./DashboardRedirect";

export default function PublicRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/profilo/:id" element={<Profilo />} />
        </Routes>
    );
}