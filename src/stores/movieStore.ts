import { create } from "zustand";
import api from "@/lib/api";
import type {
    Movie,
    Genre,
    PaginationMeta,
    MovieFilters,
    ApiResponse,
} from "@/types";

interface MovieState {
    // Data
    movies: Movie[];
    popularMovies: Movie[];
    currentMovie: Movie | null;
    genres: Genre[];

    // Pagination
    pagination: PaginationMeta | null;

    // Filters
    filters: MovieFilters;

    // Loading
    isLoading: boolean;
    isLoadingDetail: boolean;
    isLoadingPopular: boolean;

    // Actions
    fetchMovies: (filters?: MovieFilters) => Promise<void>;
    fetchPopularMovies: (page?: number, perPage?: number) => Promise<void>;
    fetchMovieDetail: (id: string) => Promise<void>;
    fetchGenres: () => Promise<void>;
    setFilters: (filters: Partial<MovieFilters>) => void;
    clearCurrentMovie: () => void;
}

export const useMovieStore = create<MovieState>((set, get) => ({
    movies: [],
    popularMovies: [],
    currentMovie: null,
    genres: [],
    pagination: null,
    filters: { sort: "popularity", order: "desc", page: 1, per_page: 20 },
    isLoading: false,
    isLoadingDetail: false,
    isLoadingPopular: false,

    fetchMovies: async (filters?: MovieFilters) => {
        set({ isLoading: true });
        try {
            const params = filters ?? get().filters;
            const { data } = await api.get<ApiResponse<Movie[]>>("/api/movies", {
                params,
            });
            set({
                movies: data.data,
                pagination: data.meta ?? null,
            });
        } catch (error) {
            console.error("Failed to fetch movies:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchPopularMovies: async (page = 1, perPage = 10) => {
        set({ isLoadingPopular: true });
        try {
            const { data } = await api.get<ApiResponse<Movie[]>>(
                "/api/movies/popular",
                {
                    params: { page, per_page: perPage },
                }
            );
            set({ popularMovies: data.data });
        } catch (error) {
            console.error("Failed to fetch popular movies:", error);
        } finally {
            set({ isLoadingPopular: false });
        }
    },

    fetchMovieDetail: async (id: string) => {
        set({ isLoadingDetail: true, currentMovie: null });
        try {
            const { data } = await api.get<ApiResponse<Movie>>(`/api/movies/${id}`);
            set({ currentMovie: data.data });
        } catch (error) {
            console.error("Failed to fetch movie detail:", error);
        } finally {
            set({ isLoadingDetail: false });
        }
    },

    fetchGenres: async () => {
        try {
            const { data } = await api.get<ApiResponse<Genre[]>>("/api/genres");
            set({ genres: data.data });
        } catch (error) {
            console.error("Failed to fetch genres:", error);
        }
    },

    setFilters: (newFilters: Partial<MovieFilters>) => {
        const current = get().filters;
        // Reset page to 1 when changing filters (not page itself)
        const resetPage = !("page" in newFilters);
        set({
            filters: {
                ...current,
                ...newFilters,
                ...(resetPage ? { page: 1 } : {}),
            },
        });
    },

    clearCurrentMovie: () => set({ currentMovie: null }),
}));
