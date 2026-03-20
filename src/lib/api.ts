import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 30000,
});

export function parseApiError(err: any, fallback: string = "An error occurred"): string {
    const data = err.response?.data;
    if (!data) return fallback;

    if (data.error !== undefined && data.error !== null) {
        // If it is a generic validation error, parse the specific list of dicts
        if (data.message === "Validation Error" && Array.isArray(data.error)) {
            // e.g. [{ field: "email", msg: "Invalid email format", type: "value_error" }, ...]
            return data.error.map((e: any) => `${e.field}: ${e.msg}`).join("\n");
        }

        // If it is just a string
        if (typeof data.error === 'string') {
            return data.error;
        }

        // If it is an array but not validation format
        if (Array.isArray(data.error)) {
            return data.error.map((e: any) => (typeof e === 'string' ? e : JSON.stringify(e))).join("\n");
        }

        // If it is an object
        if (typeof data.error === 'object') {
            return Object.entries(data.error)
                .map(([key, val]) => `${key}: ${typeof val === 'string' ? val : JSON.stringify(val)}`)
                .join("\n");
        }

        // Fallback for numbers, booleans, etc.
        return String(data.error);
    }

    return data.message || fallback;
}

// Request interceptor — attach token if available (from memory)
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = localStorage.getItem("refresh_token");

        // If 401 and we haven't retried yet, try to refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            refreshToken
        ) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh`,
                    { refresh_token: refreshToken },
                    { withCredentials: true }
                );

                const newAccessToken = data.data.access_token;
                const newRefreshToken = data.data.refresh_token;
                
                localStorage.setItem("refresh_token", newRefreshToken);
                useAuthStore.getState().setAccessToken(newAccessToken);

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("refresh_token");
                window.dispatchEvent(new Event("auth:logout"));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";
        console.error("[API Error]", message);
        return Promise.reject(error);
    }
);

export default api;
