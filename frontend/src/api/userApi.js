import axiosInstance from "./axiosInstance";

export const getProfilo = async (userId) => {
    const res = await axiosInstance.get(`/users/${userId}/profilo`);
    return res.data;
};

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await axiosInstance.post("/uploads/uploadAvatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};