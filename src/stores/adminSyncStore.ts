import { create } from "zustand";
import api, { parseApiError } from "@/lib/api";
import type { SyncLog, ApiResponse } from "@/types";

export interface SyncBatchResponse {
    status: "in_progress" | "completed" | "failed";
    endpoint: string | null;
    current_page: number | null;
    next_endpoint: string | null;
    next_page: number | null;
    total_pages: number | null;
    batch_inserted: number;
    batch_updated: number;
    cumulative_inserted: number;
    cumulative_updated: number;
    sync_log_id: string | null;
}

interface AdminSyncState {
    lastSync: SyncLog | null;
    isFetching: boolean;

    // Batch sync state
    isSyncing: boolean;
    isStopped: boolean;
    batchProgress: SyncBatchResponse | null;
    syncLogs: string[];

    fetchLastSync: () => Promise<void>;
    syncBatch: (payload: Record<string, any>) => Promise<{ success: boolean; data?: SyncBatchResponse; message: string }>;
    stopSync: () => void;
    stopSyncApi: (syncLogId: string) => Promise<{ success: boolean; message: string }>;

    runFullSync: (maxPages: number | "", resume: boolean, showToast: (msg: string, ok: boolean) => void) => Promise<void>;
    runChangesSync: (maxPages: number | "", resume: boolean, showToast: (msg: string, ok: boolean) => void) => Promise<void>;
}

export const useAdminSyncStore = create<AdminSyncState>((set, get) => ({
    lastSync: null,
    isFetching: false,

    isSyncing: false,
    isStopped: false,
    batchProgress: null,
    syncLogs: [],

    fetchLastSync: async () => {
        set({ isFetching: true });
        try {
            const { data } = await api.get<ApiResponse<SyncLog>>(
                "/api/admin/tmdb/sync/last-sync"
            );
            set({ lastSync: data.data });
        } catch (err) {
            console.error("Failed to fetch last sync:", err);
        } finally {
            set({ isFetching: false });
        }
    },

    syncBatch: async (payload) => {
        try {
            const { data } = await api.post<ApiResponse<SyncBatchResponse>>(
                "/api/admin/tmdb/sync/movies",
                payload
            );
            set({ batchProgress: data.data });
            return { success: true, data: data.data, message: data.message ?? "Batch processed" };
        } catch (err: unknown) {
            return { success: false, message: parseApiError(err, "Failed to sync batch") };
        }
    },

    stopSync: () => {
        set({ isStopped: true });
    },

    stopSyncApi: async (syncLogId: string) => {
        try {
            const { data } = await api.post<ApiResponse<SyncLog>>(
                "/api/admin/tmdb/sync/stop",
                { sync_log_id: syncLogId }
            );
            return { success: true, message: data.message ?? "Sync stopped" };
        } catch (err: unknown) {
            return { success: false, message: parseApiError(err, "Failed to stop sync") };
        }
    },

    runFullSync: async (maxPages, resume, showToast) => {
        const { lastSync, syncBatch } = get();
        set({ isSyncing: true, isStopped: false, batchProgress: null, syncLogs: [] });

        let currentEndpoint: string | null = null;
        let currentPage: number | null = null;
        let pageCount = 0;
        let currentSyncLogId: string | null = null;
        let isSyncingLoop = true;
        const maxPageLimit = maxPages === "" ? Infinity : maxPages;

        let isResuming = false;
        if (resume && lastSync && (lastSync.status === "failed" || lastSync.status === "in_progress")) {
            currentSyncLogId = lastSync.id;
            isResuming = true;
            if (lastSync.last_synced_endpoint) {
                currentEndpoint = lastSync.last_synced_endpoint;
                currentPage = (lastSync.last_synced_page || 0) + 1;
            }
            set((state) => ({ syncLogs: [...state.syncLogs, "▸ Resuming full sync..."] }));
        } else {
            set((state) => ({ syncLogs: [...state.syncLogs, "▸ Starting full sync..."] }));
        }

        // Initialization Step: get the starting endpoint and page if not resuming
        if (!isResuming) {
            set((state) => ({ syncLogs: [...state.syncLogs, "▸ Initializing sync..."] }));
            const firstPayload: Record<string, any> = { mode: "full" };
            if (maxPages !== "") firstPayload.max_pages = maxPages;
            
            const initResult = await syncBatch(firstPayload);
            if (!initResult.success || !initResult.data) {
                set((state) => ({ syncLogs: [...state.syncLogs, `✗ Error: ${initResult.message}`] }));
                showToast(initResult.message, false);
                set({ isSyncing: false });
                return;
            }

            const d = initResult.data;
            if (d.status === "completed") {
                set((state) => ({ syncLogs: [...state.syncLogs, `🎉 Sync already completed!`] }));
                showToast("Sync already completed!", true);
                set({ isSyncing: false });
                get().fetchLastSync();
                return;
            }

            currentEndpoint = d.next_endpoint;
            currentPage = d.next_page;
            currentSyncLogId = d.sync_log_id;
        }

        while (isSyncingLoop && pageCount < maxPageLimit) {
            if (get().isStopped) {
                set((state) => ({ syncLogs: [...state.syncLogs, "⏹ Sync stopped by user."] }));
                break;
            }

            const payload: Record<string, any> = { mode: "full" };
            if (currentEndpoint) payload.endpoint = currentEndpoint;
            if (currentPage) payload.page = currentPage;
            if (maxPages !== "") payload.max_pages = maxPages;
            if (currentSyncLogId) payload.sync_log_id = currentSyncLogId;

            const result = await syncBatch(payload);

            if (!result.success || !result.data) {
                set((state) => ({ syncLogs: [...state.syncLogs, `✗ Error: ${result.message}`] }));
                showToast(result.message, false);
                break;
            }

            pageCount++;
            const d = result.data;

            // Save the log ID if it's the first hit during resume
            if (!currentSyncLogId && d.sync_log_id) {
                currentSyncLogId = d.sync_log_id;
            }

            set((state) => ({
                syncLogs: [
                    ...state.syncLogs,
                    `✓ Page ${currentPage ?? 1} of ${currentEndpoint ?? "genres"} — +${d.batch_inserted} inserted, +${d.batch_updated} updated`,
                ]
            }));

            if (d.status === "completed") {
                set((state) => ({
                    syncLogs: [
                        ...state.syncLogs,
                        `🎉 Sync completed! Total: ${d.cumulative_inserted} inserted, ${d.cumulative_updated} updated.`,
                    ]
                }));
                showToast("Sync completed successfully!", true);
                isSyncingLoop = false;
                break;
            }

            if (d.status === "failed") {
                set((state) => ({ syncLogs: [...state.syncLogs, `✗ Sync failed.`] }));
                showToast("Sync failed", false);
                isSyncingLoop = false;
                break;
            }

            // Prepare for the next loop iteration
            currentEndpoint = d.next_endpoint;
            currentPage = d.next_page;
        }

        if (!get().isStopped && isSyncingLoop && pageCount >= maxPageLimit) {
            set((state) => ({ syncLogs: [...state.syncLogs, `⏸ Reached max pages limit (${maxPageLimit}).`] }));
            showToast(`Synced ${pageCount} pages (max limit reached).`, true);
        }

        set({ isSyncing: false });
        get().fetchLastSync();
    },

    runChangesSync: async (maxPages, resume, showToast) => {
        const { lastSync, syncBatch } = get();
        set({ isSyncing: true, isStopped: false, batchProgress: null, syncLogs: [] });

        let currentPage: number | null = null;
        let pageCount = 0;
        let currentSyncLogId: string | null = null;
        let isSyncingLoop = true;
        const maxPageLimit = maxPages === "" ? Infinity : maxPages;

        if (resume && lastSync && lastSync.sync_type === "changes" && (lastSync.status === "failed" || lastSync.status === "in_progress" || lastSync.status === "stopped")) {
            currentSyncLogId = lastSync.id;
            currentPage = (lastSync.last_synced_page || 0) + 1;
            set((state) => ({ syncLogs: [...state.syncLogs, "▸ Resuming changes sync..."] }));
        } else {
            set((state) => ({ syncLogs: [...state.syncLogs, "▸ Starting changes sync (last 14 days)..."] }));
            currentPage = 1;
        }

        while (isSyncingLoop && pageCount < maxPageLimit) {
            if (get().isStopped) {
                set((state) => ({ syncLogs: [...state.syncLogs, "⏹ Sync stopped by user."] }));
                break;
            }

            const payload: Record<string, any> = { mode: "changes" };
            if (currentPage) payload.page = currentPage;
            if (maxPages !== "") payload.max_pages = maxPages;
            if (currentSyncLogId) payload.sync_log_id = currentSyncLogId;

            const result = await syncBatch(payload);

            if (!result.success || !result.data) {
                set((state) => ({ syncLogs: [...state.syncLogs, `✗ Error: ${result.message}`] }));
                showToast(result.message, false);
                break;
            }

            pageCount++;
            const d = result.data;

            if (!currentSyncLogId && d.sync_log_id) {
                currentSyncLogId = d.sync_log_id;
            }

            set((state) => ({
                syncLogs: [
                    ...state.syncLogs,
                    `✓ Page ${currentPage ?? 1} — +${d.batch_inserted} inserted, +${d.batch_updated} updated`,
                ]
            }));

            if (d.status === "completed") {
                set((state) => ({
                    syncLogs: [
                        ...state.syncLogs,
                        `🎉 Changes sync completed! Total: ${d.cumulative_inserted} inserted, ${d.cumulative_updated} updated.`,
                    ]
                }));
                showToast("Changes sync completed!", true);
                isSyncingLoop = false;
                break;
            }

            if (d.status === "failed") {
                set((state) => ({ syncLogs: [...state.syncLogs, `✗ Sync failed.`] }));
                showToast("Sync failed", false);
                isSyncingLoop = false;
                break;
            }

            currentPage = d.next_page;
        }

        if (!get().isStopped && isSyncingLoop && pageCount >= maxPageLimit) {
            set((state) => ({ syncLogs: [...state.syncLogs, `⏸ Reached max pages limit (${maxPageLimit}).`] }));
            showToast(`Synced ${pageCount} pages (max limit reached).`, true);
        }

        set({ isSyncing: false });
        get().fetchLastSync();
    },
}));
