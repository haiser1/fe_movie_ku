import { create } from "zustand";
import api, { parseApiError } from "@/lib/api";
import type {
    Movie,
    AdminMovieCreateRequest,
    AdminMovieUpdateRequest,
    PaginationMeta,
    ApiResponse,
} from "@/types";

interface AdminMovieFilters {
    search?: string;
    source?: "tmdb" | "user" | "admin" | "";
    status?: "active" | "archived" | "";
    sort?: string;
    order?: "asc" | "desc";
    page?: number;
    per_page?: number;
}

interface AdminMovieState {
    movies: Movie[];
    pagination: PaginationMeta | null;
    isLoading: boolean;

    fetchMovies: (filters?: AdminMovieFilters) => Promise<void>;
    createMovie: (data: AdminMovieCreateRequest) => Promise<{ success: boolean; message: string }>;
    updateMovie: (id: string, data: AdminMovieUpdateRequest) => Promise<{ success: boolean; message: string }>;
    deleteMovie: (id: string) => Promise<{ success: boolean; message: string }>;
    reactivateMovie: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const useAdminMovieStore = create<AdminMovieState>((set) => ({
    movies: [],
    pagination: null,
    isLoading: false,

    fetchMovies: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const params: Record<string, string | number> = {
                page: filters.page ?? 1,
                per_page: filters.per_page ?? 20,
                sort: filters.sort ?? "created_at",
                order: filters.order ?? "desc",
            };
            if (filters.search) params.search = filters.search;
            if (filters.source) params.source = filters.source;
            if (filters.status) params.status = filters.status;

            const { data } = await api.get<ApiResponse<Movie[]>>(
                "/api/admin/movies",
                { params }
            );
            set({ movies: data.data, pagination: data.meta ?? null });
        } catch (err) {
            console.error("Failed to fetch admin movies:", err);
        } finally {
            set({ isLoading: false });
        }
    },

    createMovie: async (reqData) => {
        try {
            const { data } = await api.post<ApiResponse<Movie>>(
                "/api/admin/movies",
                reqData
            );
            set((state) => ({ movies: [data.data, ...state.movies] }));
            return { success: true, message: data.message || "Movie created successfully" };
        } catch (err: any) {
            console.error("Failed to create movie:", err);
            return { success: false, message: parseApiError(err, "Failed to create movie") };
        }
    },

    updateMovie: async (id, reqData) => {
        try {
            const { data } = await api.put<ApiResponse<Movie>>(
                `/api/admin/movies/${id}`,
                reqData
            );
            set((state) => ({
                movies: state.movies.map((m) => (m.id === id ? data.data : m)),
            }));
            return { success: true, message: data.message || "Movie updated successfully" };
        } catch (err: any) {
            console.error("Failed to update movie:", err);
            return { success: false, message: parseApiError(err, "Failed to update movie") };
        }
    },

    deleteMovie: async (id) => {
        try {
            const { data } = await api.delete(`/api/admin/movies/${id}`);
            // Soft delete: update status to archived locally
            set((state) => ({
                movies: state.movies.map((m) => (m.id === id ? { ...m, status: "archived" } : m)),
            }));
            return { success: true, message: data.message || "Movie deleted successfully" };
        } catch (err: any) {
            console.error("Failed to delete movie:", err);
            return { success: false, message: parseApiError(err, "Failed to delete movie") };
        }
    },

    reactivateMovie: async (id) => {
        try {
            const { data } = await api.patch<ApiResponse<Movie>>(`/api/admin/movies/${id}/reactivate`);
            set((state) => ({
                movies: state.movies.map((m) => (m.id === id ? data.data : m)),
            }));
            return { success: true, message: data.message || "Movie reactivated successfully" };
        } catch (err: any) {
            console.error("Failed to reactivate movie:", err);
            return { success: false, message: parseApiError(err, "Failed to reactivate movie") };
        }
    },
}));
