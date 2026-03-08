import { create } from "zustand";
import api, { parseApiError } from "@/lib/api";
import type {
    Wishlist,
    WishlistCreateRequest,
    PaginationMeta,
    ApiResponse,
} from "@/types";

interface WishlistState {
    wishlists: Wishlist[];
    pagination: PaginationMeta | null;
    isLoading: boolean;

    fetchWishlists: (page?: number, perPage?: number) => Promise<void>;
    addToWishlist: (data: WishlistCreateRequest) => Promise<{ success: boolean; message: string }>;
    removeFromWishlist: (id: string) => Promise<{ success: boolean; message: string }>;
    isInWishlist: (movieId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlists: [],
    pagination: null,
    isLoading: false,

    fetchWishlists: async (page = 1, perPage = 20) => {
        set({ isLoading: true });
        try {
            const { data } = await api.get<ApiResponse<Wishlist[]>>(
                "/api/wishlists",
                { params: { page, per_page: perPage } }
            );
            set({
                wishlists: data.data,
                pagination: data.meta ?? null,
            });
        } catch (error) {
            console.error("Failed to fetch wishlists:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addToWishlist: async (reqData: WishlistCreateRequest) => {
        try {
            const { data } = await api.post<ApiResponse<Wishlist>>(
                "/api/wishlists",
                reqData
            );
            set((state) => ({
                wishlists: [data.data, ...state.wishlists],
            }));
            return { success: true, message: data.message || "Added to wishlist" };
        } catch (error: any) {
            console.error("Failed to add to wishlist:", error);
            return { success: false, message: parseApiError(error, "Failed to add to wishlist") };
        }
    },

    removeFromWishlist: async (id: string) => {
        try {
            const { data } = await api.delete(`/api/wishlists/${id}`);
            set((state) => ({
                wishlists: state.wishlists.filter((w) => w.id !== id),
            }));
            return { success: true, message: data?.message || "Removed from wishlist" };
        } catch (error: any) {
            console.error("Failed to remove from wishlist:", error);
            return { success: false, message: parseApiError(error, "Failed to remove from wishlist") };
        }
    },

    isInWishlist: (movieId: string) => {
        return get().wishlists.some((w) => w.movie_id === movieId);
    },
}));
