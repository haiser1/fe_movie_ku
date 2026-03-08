import { create } from "zustand";
import api from "@/lib/api";
import { setTokens, clearTokens, parseApiError } from "@/lib/api";
import type { UserProfile, ApiResponse, RegisterUserRequest, LoginUserPasswordRequest } from "@/types";

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    fetchUser: () => Promise<void>;
    handleOAuthCallback: (params: URLSearchParams) => Promise<UserProfile | null>;
    loginWithEmail: (data: LoginUserPasswordRequest) => Promise<{ success: boolean; message: string }>;
    registerWithEmail: (data: RegisterUserRequest) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

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
                isAuthenticated: false,
            });
            clearTokens();
        } finally {
            set({ isLoading: false });
        }
    },

    handleOAuthCallback: async (params: URLSearchParams) => {
        set({ isLoading: true });
        try {
            // Tokens might come from URL params (BE redirect with query params)
            const accessToken = params.get("access_token");
            const refreshTokenVal = params.get("refresh_token");

            if (accessToken && refreshTokenVal) {
                setTokens(accessToken, refreshTokenVal);
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
            set({ user: null, isAuthenticated: false });
            clearTokens();
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    loginWithEmail: async (data: LoginUserPasswordRequest) => {
        set({ isLoading: true });
        try {
            await api.post("/api/auth/email-password/login", data);
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
            await api.post("/api/auth/logout");
        } catch {
            // Ignore logout API errors
        } finally {
            clearTokens();
            set({ user: null, isAuthenticated: false });
        }
    },

    reset: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false, isLoading: false });
    },
}));

// Listen for forced logout from API interceptor
if (typeof window !== "undefined") {
    window.addEventListener("auth:logout", () => {
        useAuthStore.getState().reset();
    });
}
