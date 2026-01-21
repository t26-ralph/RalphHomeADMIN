import axiosClient from "./axiosClient";

const userApi = {
    getAll: () => axiosClient.get("/users"),
    getOne: (id) => axiosClient.get(`/users/${id}`),
    updateRole: (id, role) => axiosClient.put(`/users/${id}/role`, { role }),
    remove: (id) => axiosClient.delete(`/users/${id}`),
};

export default userApi;
