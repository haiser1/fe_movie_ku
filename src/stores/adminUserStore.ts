import { create } from "zustand";
import api, { parseApiError } from "@/lib/api";
import type {
    AdminUserResponse,
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    PaginationMeta,
    ApiResponse,
} from "@/types";

interface AdminUserFilters {
    search?: string;
    role?: "user" | "admin" | "";
    status?: "active" | "inactive" | "";
    sort_by?: "name" | "email" | "created_at";
    order_by?: "asc" | "desc";
    page?: number;
    per_page?: number;
}

interface AdminUserState {
    users: AdminUserResponse[];
    pagination: PaginationMeta | null;
    isLoading: boolean;

    fetchUsers: (filters?: AdminUserFilters) => Promise<void>;
    createUser: (data: AdminCreateUserRequest) => Promise<{ success: boolean; message: string }>;
    updateUser: (id: string, data: AdminUpdateUserRequest) => Promise<{ success: boolean; message: string }>;
    deleteUser: (id: string) => Promise<{ success: boolean; message: string }>;
    reactivateUser: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const useAdminUserStore = create<AdminUserState>((set) => ({
    users: [],
    pagination: null,
    isLoading: false,

    fetchUsers: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const params: Record<string, string | number> = {
                page: filters.page ?? 1,
                per_page: filters.per_page ?? 20,
                sort_by: filters.sort_by ?? "created_at",
                order_by: filters.order_by ?? "desc",
            };
            if (filters.search) params.search = filters.search;
            if (filters.role) params.role = filters.role;
            if (filters.status) params.status = filters.status;

            const { data } = await api.get<ApiResponse<AdminUserResponse[]>>(
                "/api/admin/users",
                { params }
            );
            set({ users: data.data, pagination: data.meta ?? null });
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            set({ isLoading: false });
        }
    },

    createUser: async (reqData) => {
        try {
            const { data } = await api.post<ApiResponse<AdminUserResponse>>(
                "/api/admin/users",
                reqData
            );
            set((state) => ({ users: [data.data, ...state.users] }));
            return { success: true, message: data.message || "User created successfully" };
        } catch (err: any) {
            console.error("Failed to create user:", err);
            return { success: false, message: parseApiError(err, "Failed to create user") };
        }
    },

    updateUser: async (id, reqData) => {
        try {
            const { data } = await api.put<ApiResponse<AdminUserResponse>>(
                `/api/admin/users/${id}`,
                reqData
            );
            set((state) => ({
                users: state.users.map((u) => (u.id === id ? data.data : u)),
            }));
            return { success: true, message: data.message || "User updated successfully" };
        } catch (err: any) {
            console.error("Failed to update user:", err);
            return { success: false, message: parseApiError(err, "Failed to update user") };
        }
    },

    deleteUser: async (id) => {
        try {
            const { data } = await api.delete(`/api/admin/users/${id}`);
            // Do not filter out, just update the deleted_at locally so it shows as inactive 
            set((state) => ({
                users: state.users.map((u) => u.id === id ? { ...u, deleted_at: new Date().toISOString() } : u),
            }));
            return { success: true, message: data.message || "User deleted successfully" };
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            return { success: false, message: parseApiError(err, "Failed to delete user") };
        }
    },

    reactivateUser: async (id) => {
        try {
            const { data } = await api.patch<ApiResponse<AdminUserResponse>>(`/api/admin/users/${id}/reactivate`);
            set((state) => ({
                users: state.users.map((u) => u.id === id ? data.data : u),
            }));
            return { success: true, message: data.message || "User reactivated successfully" };
        } catch (err: any) {
            console.error("Failed to reactivate user:", err);
            return { success: false, message: parseApiError(err, "Failed to reactivate user") };
        }
    },
}));
