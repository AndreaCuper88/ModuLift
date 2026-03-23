import axios from "../../api/axiosInstance";

export async function getMisure(token) {
    const res = await axios.get("/cliente/misure", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
}

export async function getAltezza(userId, token) {
    const res = await axios.get(`/users/${userId}/getHeight`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
}