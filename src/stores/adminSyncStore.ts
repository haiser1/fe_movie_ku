import { create } from "zustand";
import api, { parseApiError } from "@/lib/api";
import type { SyncLog, ApiResponse } from "@/types";

interface SyncTriggerResult {
    message: string;
    type: string;
    started_at: string;
}

interface AdminSyncState {
    syncStatus: SyncLog | null;
    lastSync: SyncLog | null;
    isFetching: boolean;
    isTriggering: boolean;

    fetchStatus: () => Promise<SyncLog | null>;
    fetchLastSync: () => Promise<void>;
    triggerSync: (mode?: "full" | "changes", resume?: boolean, maxPages?: number | "") => Promise<{ success: boolean; message: string }>;
    cancelSync: () => Promise<{ success: boolean; message: string }>;
}

export const useAdminSyncStore = create<AdminSyncState>((set) => ({
    syncStatus: null,
    lastSync: null,
    isFetching: false,
    isTriggering: false,

    fetchStatus: async () => {
        set({ isFetching: true });
        try {
            const { data } = await api.get<ApiResponse<SyncLog>>(
                "/api/admin/tmdb/sync/status"
            );
            set({ syncStatus: data.data });
            return data.data;
        } catch (err) {
            console.error("Failed to fetch sync status:", err);
            return null;
        } finally {
            set({ isFetching: false });
        }
    },

    fetchLastSync: async () => {
        try {
            const { data } = await api.get<ApiResponse<SyncLog>>(
                "/api/admin/tmdb/sync/last-sync"
            );
            set({ lastSync: data.data });
        } catch (err) {
            console.error("Failed to fetch last sync:", err);
        }
    },

    triggerSync: async (mode = "full", resume = false, maxPages: number | "" = "") => {
        set({ isTriggering: true });
        try {
            const payload: Record<string, any> = { mode, resume };
            if (maxPages !== "") {
                payload.max_pages = maxPages;
            }
            const { data } = await api.post<ApiResponse<SyncTriggerResult>>(
                "/api/admin/tmdb/sync/movies",
                payload
            );
            return { success: true, message: data.message ?? "Sync started" };
        } catch (err: unknown) {
            return { success: false, message: parseApiError(err, "Failed to trigger sync") };
        } finally {
            set({ isTriggering: false });
        }
    },

    cancelSync: async () => {
        try {
            const { data } = await api.post<ApiResponse<null>>(
                "/api/admin/tmdb/sync/stop"
            );
            return { success: true, message: data.message ?? "Sync stop requested" };
        } catch (err: unknown) {
            return { success: false, message: parseApiError(err, "Failed to stop sync") };
        }
    },
}));
