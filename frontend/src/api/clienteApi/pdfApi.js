import axiosInstance from "../axiosInstance";

export const downloadPianoAlimentarePdf = async (accessToken, plan) => {
    const response = await axiosInstance.post(
        "/cliente/pdf/piano-alimentare",
        { plan },
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: "blob", // ← fondamentale per ricevere il PDF
        }
    );
    return response.data;
};