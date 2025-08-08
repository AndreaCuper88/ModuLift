import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function DashboardRedirect() {
    const { auth } = useAuth();

    if (!auth.user) return <Navigate to="/" />;
    if (auth.user.ruolo === "admin") return <Navigate to="/admin/dashboard" />;
    if (auth.user.ruolo === "cliente") return <Navigate to="/cliente/dashboard" />;

    return <Navigate to="/" />;
}