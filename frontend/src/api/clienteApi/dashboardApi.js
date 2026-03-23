import axios from "../../api/axiosInstance";

export const getLastWorkout = async (token) => {
    const res = await axios.get(`/cliente/workout/last-workout`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.data;
};