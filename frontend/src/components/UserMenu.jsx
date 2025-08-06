import useAuth from "../hooks/useAuth";

export default function UserMenu() {
    const { auth, logout } = useAuth();

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={logout}
                className="ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
}
