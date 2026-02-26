import axios from "axios";

// Using relative path to benefit from Vite proxy or the current environment setup
const BASE_URL = "";

export const getPendingServices = async () => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.get(
        `${BASE_URL}/api/services/pending`,
        {
            params: {
                limit: 1000,
                page: 1,
            },
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
                "X-User-Id": localStorage.getItem("userId") || "",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const approveService = async (serviceId) => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.put(
        `${BASE_URL}/api/services/${serviceId}/approve`,
        { status: "Accepted" },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const rejectService = async (serviceId, reason) => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.put(
        `${BASE_URL}/api/services/${serviceId}/reject`,
        { reason, status: "Rejected" },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const getProviderDetails = async (providerId) => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.get(
        `${BASE_URL}/api/provider/active/${providerId}`,
        {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
                "X-User-Id": localStorage.getItem("userId") || "",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const getProviderServices = async (userId) => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.get(
        `${BASE_URL}/api/service/provider/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const getPendingProviders = async () => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.get(
        `${BASE_URL}/api/providers/pending`,
        {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
                "X-User-Id": localStorage.getItem("userId") || "",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const approveProvider = async (providerId) => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.put(
        `${BASE_URL}/api/providers/${providerId}/approve`,
        {},
        {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
                "X-User-Id": localStorage.getItem("userId") || "",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};

export const rejectProvider = async (providerId, reason) => {
    const rawToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = rawToken ? rawToken.trim() : null;

    return axios.put(
        `${BASE_URL}/api/providers/${providerId}/reject`,
        { reason },
        {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
                "X-User-Id": localStorage.getItem("userId") || "",
                "ngrok-skip-browser-warning": "true",
            },
        }
    );
};
