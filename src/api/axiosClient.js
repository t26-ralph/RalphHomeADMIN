import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3000/api", // backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

// tự động gắn token nếu có
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosClient;