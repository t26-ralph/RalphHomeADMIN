import axiosClient from "./axiosClient";

const statsApi = {
    getDashboard: ({ month, year }) => {
        return axiosClient.get("/stats/dashboard", {
            params: { month, year },
        });
    },
};

export default statsApi;
