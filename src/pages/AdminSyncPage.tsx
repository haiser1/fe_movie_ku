import { useEffect, useRef, useState } from "react";
import { useAdminSyncStore } from "@/stores/adminSyncStore";
import {
    RefreshCw, CheckCircle2, XCircle, Clock, Loader2,
    Database, Play, Radio, Hash, Link,
} from "lucide-react";
import type { SyncLog } from "@/types";

const POLL_INTERVAL_MS = 5000;

function StatusBadge({ status, isRunning }: { status: string; isRunning: boolean }) {
    const effectiveStatus = isRunning ? "running" : status;
    const map: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
        success: { label: "Success", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
        failed: { label: "Failed", color: "bg-red-500/15 text-red-400", icon: XCircle },
        running: { label: "Running", color: "bg-amber-500/15 text-amber-400", icon: Loader2 },
    };
    const s = map[effectiveStatus] ?? { label: effectiveStatus, color: "bg-white/10 text-white/50", icon: Clock };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.color}`}>
            <s.icon className={`h-3.5 w-3.5 ${effectiveStatus === "running" ? "animate-spin" : ""}`} />
            {s.label}
        </span>
    );
}

function SyncCard({ log, isLive }: { log: SyncLog; isLive: boolean }) {
    const running = isLive && !!log.is_running;
    return (
        <div className={`rounded-xl border p-6 transition-colors ${running
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-white/5 bg-white/5"
            }`}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    {running ? (
                        <span className="flex items-center gap-2">
                            Live Status
                            <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-400/70">
                                <Radio className="h-3 w-3 animate-pulse" /> polling every 5s
                            </span>
                        </span>
                    ) : "Last Completed Sync"}
                </h2>
                <StatusBadge status={log.status} isRunning={running} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {log.total_inserted !== undefined && (
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                        <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Inserted</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-400">
                            {log.total_inserted.toLocaleString()}
                        </p>
                    </div>
                )}
                {log.total_updated !== undefined && (
                    <div className="rounded-lg bg-blue-500/10 p-3">
                        <p className="text-xs text-blue-400/70 uppercase tracking-wider">Updated</p>
                        <p className="mt-1 text-2xl font-bold text-blue-400">
                            {log.total_updated.toLocaleString()}
                        </p>
                    </div>
                )}
                <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Last Sync At</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {new Date(log.last_sync_at).toLocaleString()}
                    </p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider">
                        {running ? "Started At" : "Created"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {new Date(log.created_at).toLocaleString()}
                    </p>
                </div>
                {/* Live-only fields */}
                {running && log.last_synced_endpoint && (
                    <div className="rounded-lg bg-white/5 p-3 flex items-start gap-2 sm:col-span-2">
                        <Link className="h-3.5 w-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Last Endpoint</p>
                            <p className="text-sm font-mono text-white/80 truncate">{log.last_synced_endpoint}</p>
                        </div>
                        {log.last_synced_page != null && (
                            <div className="ml-auto flex-shrink-0 flex items-center gap-1 text-xs text-white/40">
                                <Hash className="h-3 w-3" />
                                page {log.last_synced_page}
                            </div>
                        )}
                    </div>
                )}
                {log.error_message && (
                    <div className="rounded-lg bg-red-500/10 p-3 sm:col-span-2">
                        <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">Error</p>
                        <p className="text-sm text-red-300 font-mono break-all">{log.error_message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminSyncPage() {
    const { syncStatus, lastSync, isFetching, isTriggering, fetchStatus, fetchLastSync, triggerSync, cancelSync } =
        useAdminSyncStore();

    const [syncMode, setSyncMode] = useState<"full" | "changes">("full");
    const [resume, setResume] = useState(false);
    const [maxPages, setMaxPages] = useState<number | "">("");
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isCancelling, setIsCancelling] = useState(false);

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const startPolling = () => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            const result = await fetchStatus();
            if (result && !result.is_running) {
                stopPolling();
                fetchLastSync(); // sync done, switch to last-sync data
            }
        }, POLL_INTERVAL_MS);
    };

    // Initial fetch: check status first, if running → poll, otherwise → show last sync
    useEffect(() => {
        fetchStatus().then((result) => {
            if (result?.is_running) {
                startPolling();
            } else {
                fetchLastSync();
            }
        });
        return () => stopPolling();
    }, []);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const handleTrigger = async () => {
        const result = await triggerSync(syncMode, resume, maxPages);
        showToast(result.message, result.success);
        if (result.success) {
            setTimeout(async () => {
                const status = await fetchStatus();
                if (status?.is_running) startPolling();
            }, 1500);
        }
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        const result = await cancelSync();
        showToast(result.message, result.success);
        setIsCancelling(false);
        // Polling will naturally pick up when the status changes to stopped.
    };

    const handleRefresh = async () => {
        const result = await fetchStatus();
        if (result?.is_running) {
            startPolling();
        } else {
            fetchLastSync();
        }
    };

    // Determine which data to show: live status if running, otherwise last sync
    const isRunning = !!syncStatus?.is_running;
    const displayLog = isRunning ? syncStatus : lastSync;
    const isPolling = pollRef.current !== null;

    const isMaxPagesValid = maxPages === "" || (maxPages > 0 && maxPages <= 500);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl transition-all ${toast.ok ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                        }`}
                >
                    {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <RefreshCw className="h-6 w-6 text-amber-500" />
                        TMDB Sync
                    </h1>
                    <p className="mt-1 text-sm text-white/40">Manage TMDB data synchronization</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Trigger Sync Panel */}
            <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
                <h2 className="mb-4 text-base font-semibold text-white flex items-center gap-2">
                    <Play className="h-4 w-4 text-amber-500" />
                    Trigger New Sync
                </h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                            Mode
                        </label>
                        <select
                            value={syncMode}
                            onChange={(e) => setSyncMode(e.target.value as "full" | "changes")}
                            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none [&>option]:bg-neutral-900"
                        >
                            <option value="full">Full — sync all TMDB movies</option>
                            <option value="changes">Changes — last 14 days only</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-white/50">
                            <span>Max Pages</span>
                            {!isMaxPagesValid && <span className="normal-case tracking-normal text-red-400">&gt; 0</span>}
                            {!isMaxPagesValid && <span className="normal-case tracking-normal text-red-400">&lt; 500</span>}
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="500"
                            placeholder="All"
                            value={maxPages}
                            onChange={(e) => setMaxPages(e.target.value === "" ? "" : parseInt(e.target.value))}
                            className={`h-9 w-24 rounded-lg border px-3 text-sm outline-none transition-colors ${isMaxPagesValid
                                ? "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-amber-500"
                                : "border-red-500/50 bg-red-500/10 text-red-400"
                                }`}
                        />
                    </div>
                    {syncMode === "full" && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
                            <input
                                type="checkbox"
                                checked={resume}
                                onChange={(e) => setResume(e.target.checked)}
                                className="h-4 w-4 rounded accent-amber-500"
                            />
                            Resume failed
                        </label>
                    )}
                    <button
                        onClick={handleTrigger}
                        disabled={isTriggering || isRunning || !isMaxPagesValid}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-60"
                    >
                        {isTriggering ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        {isTriggering ? "Starting…" : isRunning ? "Sync Running…" : "Start Sync"}
                    </button>
                    {isRunning && (
                        <button
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            Cancel Sync
                        </button>
                    )}
                </div>
                <p className="mt-3 text-xs text-white/30">
                    {isPolling
                        ? "⚡ Sync in progress — status updates automatically every 5 seconds."
                        : "Sync runs in the background. Returns 409 if a sync is already running."}
                </p>
            </div>

            {/* Single Sync Card */}
            <div>
                {isFetching && !displayLog ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    </div>
                ) : displayLog ? (
                    <SyncCard log={displayLog} isLive={isRunning} />
                ) : (
                    <div className="flex justify-center py-12">
                        <p className="text-white/30">No sync data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
