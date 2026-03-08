import { create } from "zustand";
import api, { parseApiError } from "@/lib/api";
import type {
    Movie,
    MovieCreateRequest,
    MovieUpdateRequest,
    PaginationMeta,
    ApiResponse,
} from "@/types";

interface UserMovieState {
    myMovies: Movie[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    isSaving: boolean;

    fetchMyMovies: (page?: number, perPage?: number) => Promise<void>;
    createMovie: (data: MovieCreateRequest) => Promise<{ success: boolean; message: string }>;
    updateMovie: (id: string, data: MovieUpdateRequest) => Promise<{ success: boolean; message: string }>;
    deleteMovie: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const useUserMovieStore = create<UserMovieState>((set) => ({
    myMovies: [],
    pagination: null,
    isLoading: false,
    isSaving: false,

    fetchMyMovies: async (page = 1, perPage = 20) => {
        set({ isLoading: true });
        try {
            const { data } = await api.get<ApiResponse<Movie[]>>(
                "/api/movies/me",
                { params: { page, per_page: perPage } }
            );
            set({
                myMovies: data.data,
                pagination: data.meta ?? null,
            });
        } catch (error) {
            console.error("Failed to fetch user movies:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    createMovie: async (reqData: MovieCreateRequest) => {
        set({ isSaving: true });
        try {
            const { data } = await api.post<ApiResponse<Movie>>(
                "/api/movies/user",
                reqData
            );
            set((state) => ({
                myMovies: [data.data, ...state.myMovies],
            }));
            return { success: true, message: data.message || "Movie created successfully" };
        } catch (error: any) {
            console.error("Failed to create movie:", error);
            return { success: false, message: parseApiError(error, "Failed to create movie") };
        } finally {
            set({ isSaving: false });
        }
    },

    updateMovie: async (id: string, reqData: MovieUpdateRequest) => {
        set({ isSaving: true });
        try {
            const { data } = await api.put<ApiResponse<Movie>>(
                `/api/movies/user/${id}`,
                reqData
            );
            set((state) => ({
                myMovies: state.myMovies.map((m) =>
                    m.id === id ? data.data : m
                ),
            }));
            return { success: true, message: data.message || "Movie updated successfully" };
        } catch (error: any) {
            console.error("Failed to update movie:", error);
            return { success: false, message: parseApiError(error, "Failed to update movie") };
        } finally {
            set({ isSaving: false });
        }
    },

    deleteMovie: async (id: string) => {
        try {
            const { data } = await api.delete(`/api/movies/user/${id}`);
            set((state) => ({
                myMovies: state.myMovies.filter((m) => m.id !== id),
            }));
            return { success: true, message: data?.message || "Movie deleted successfully" };
        } catch (error: any) {
            console.error("Failed to delete movie:", error);
            return { success: false, message: parseApiError(error, "Failed to delete movie") };
        }
    },
}));
