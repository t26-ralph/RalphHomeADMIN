import axiosClient from "./axiosClient";

const hotelApi = {
    getAll: () => axiosClient.get("/hotels"),
    getOne: (id) => axiosClient.get(`/hotels/${id}`),
    create: (data) => axiosClient.post("/hotels", data),
    update: (id, data) => axiosClient.put(`/hotels/${id}`, data),
    remove: (id) => axiosClient.delete(`/hotels/${id}`),
};

export default hotelApi;
