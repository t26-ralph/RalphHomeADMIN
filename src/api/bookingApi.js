import axiosClient from "./axiosClient";

const bookingApi = {
    getAll: () => axiosClient.get("/bookings"),
    getById: (id) => axiosClient.get(`/bookings/${id}`),
    remove: (id) => axiosClient.delete(`/bookings/${id}`),
    updateStatus: (id, status) => axiosClient.put(`/bookings/${id}`, { status }),
};

export default bookingApi;
