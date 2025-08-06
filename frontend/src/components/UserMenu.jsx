import useAuth from "../hooks/useAuth";

export default function UserMenu({setAlert}) {
    const { auth, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        setAlert({message:"Logout effettuato con successo!!!", type: "success"});
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleLogout}
                className="ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
}
