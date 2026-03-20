import { create } from "zustand";
import api from "@/lib/api";
import { parseApiError } from "@/lib/api";
import type { UserProfile, ApiResponse, RegisterUserRequest, LoginUserPasswordRequest } from "@/types";

interface AuthState {
    user: UserProfile | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    fetchUser: () => Promise<void>;
    handleOAuthCallback: (params: URLSearchParams) => Promise<UserProfile | null>;
    loginWithEmail: (data: LoginUserPasswordRequest) => Promise<{ success: boolean; message: string }>;
    registerWithEmail: (data: RegisterUserRequest) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    reset: () => void;
    setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,

    setAccessToken: (token: string | null) => {
        set({ accessToken: token });
    },

    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get<ApiResponse<UserProfile>>(
                "/api/auth/me"
            );
            set({
                user: data.data,
                isAuthenticated: true,
            });
        } catch {
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
            });
            localStorage.removeItem("refresh_token");
        } finally {
            set({ isLoading: false });
        }
    },

    handleOAuthCallback: async (params: URLSearchParams) => {
        set({ isLoading: true });
        try {
            const accessTokenVal = params.get("access_token");
            const refreshTokenVal = params.get("refresh_token");

            if (accessTokenVal && refreshTokenVal) {
                localStorage.setItem("refresh_token", refreshTokenVal);
                set({ accessToken: accessTokenVal });
            }

            // Now fetch user profile
            const { data } = await api.get<ApiResponse<UserProfile>>(
                "/api/auth/me"
            );
            set({
                user: data.data,
                isAuthenticated: true,
            });
            return data.data;
        } catch {
            set({ user: null, accessToken: null, isAuthenticated: false });
            localStorage.removeItem("refresh_token");
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    loginWithEmail: async (data: LoginUserPasswordRequest) => {
        set({ isLoading: true });
        try {
            const response = await api.post("/api/auth/email-password/login", data);

            const accessTokenVal = response.data.data?.access_token;
            const refreshTokenVal = response.data.data?.refresh_token;

            if (accessTokenVal && refreshTokenVal) {
                localStorage.setItem("refresh_token", refreshTokenVal);
                set({ accessToken: accessTokenVal });
            }

            await get().fetchUser();
            return { success: true, message: "Logged in successfully" };
        } catch (error: any) {
            const msg = parseApiError(error, "Login failed");
            set({ isLoading: false });
            return { success: false, message: msg };
        }
    },

    registerWithEmail: async (data: RegisterUserRequest) => {
        set({ isLoading: true });
        try {
            await api.post("/api/auth/register", data);
            set({ isLoading: false });
            return { success: true, message: "Registration successful. Please login." };
        } catch (error: any) {
            const msg = parseApiError(error, "Registration failed");
            set({ isLoading: false });
            return { success: false, message: msg };
        }
    },

    logout: async () => {
        try {
            // Include refresh token if needed for backend invalidation, though API handles it if token is passed
            await api.post("/api/auth/logout");
        } catch {
            // Ignore logout API errors
        } finally {
            localStorage.removeItem("refresh_token");
            set({ user: null, accessToken: null, isAuthenticated: false });
        }
    },

    reset: () => {
        localStorage.removeItem("refresh_token");
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    },
}));

// Listen for forced logout from API interceptor
if (typeof window !== "undefined") {
    window.addEventListener("auth:logout", () => {
        useAuthStore.getState().reset();
    });
}
