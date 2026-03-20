import { useEffect, useState, useRef } from "react";
import { useAdminSyncStore, getActiveSyncLogId, getActiveSyncSession, type SyncBatchResponse } from "@/stores/adminSyncStore";
import {
    RefreshCw, CheckCircle2, XCircle, Clock, Loader2,
    Database, Play, Hash, Link, StopCircle, AlertTriangle,
} from "lucide-react";
import type { SyncLog } from "@/types";

/* ——— Status Badge ——— */
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
        success: { label: "Success", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
        completed: { label: "Completed", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
        failed: { label: "Failed", color: "bg-red-500/15 text-red-400", icon: XCircle },
        in_progress: { label: "In Progress", color: "bg-amber-500/15 text-amber-400", icon: Loader2 },
        stopped: { label: "Stopped", color: "bg-orange-500/15 text-orange-400", icon: StopCircle },
    };
    const s = map[status] ?? { label: status, color: "bg-white/10 text-white/50", icon: Clock };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.color}`}>
            <s.icon className={`h-3.5 w-3.5 ${status === "in_progress" ? "animate-spin" : ""}`} />
            {s.label}
        </span>
    );
}

/* ——— Last Sync Card ——— */
function SyncCard({ log }: { log: SyncLog }) {
    return (
        <div className="rounded-xl border border-white/5 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    Last Completed Sync
                </h2>
                <StatusBadge status={log.status} />
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
                    <p className="text-xs text-white/40 uppercase tracking-wider">Sync Type</p>
                    <p className="mt-1 text-sm font-semibold text-white capitalize">{log.sync_type}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Last Sync At</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {new Date(log.last_sync_at).toLocaleString()}
                    </p>
                </div>
                {log.last_synced_endpoint && (
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

/* ——— Live Progress Card ——— */
function ProgressCard({ progress, logs }: { progress: SyncBatchResponse; logs: string[] }) {
    return (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    <span className="flex items-center gap-2">
                        Sync In Progress
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                    </span>
                </h2>
                <StatusBadge status={progress.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Total Inserted</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">
                        {progress.cumulative_inserted.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                    <p className="text-xs text-blue-400/70 uppercase tracking-wider">Total Updated</p>
                    <p className="mt-1 text-2xl font-bold text-blue-400">
                        {progress.cumulative_updated.toLocaleString()}
                    </p>
                </div>
                {progress.endpoint && (
                    <div className="rounded-lg bg-white/5 p-3 sm:col-span-2">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Endpoint</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-white/80 truncate">{progress.endpoint}</p>
                            {progress.current_page != null && (
                                <span className="flex-shrink-0 flex items-center gap-1 text-xs text-white/40">
                                    <Hash className="h-3 w-3" />
                                    page {progress.current_page}{progress.total_pages ? ` / ${progress.total_pages}` : ""}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Batch Log */}
            {logs.length > 0 && (
                <div className="rounded-lg bg-black/30 p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Sync Log</p>
                    <div className="space-y-0.5 font-mono text-xs text-white/60">
                        {logs.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ——— Main Page ——— */
export default function AdminSyncPage() {
    const { 
        lastSync, isFetching, batchProgress, 
        isSyncing, syncLogs,
        fetchLastSync, stopSync, runFullSync, runChangesSync
    } = useAdminSyncStore();

    const [syncMode, setSyncMode] = useState<"full" | "changes">("full");
    const [maxPages, setMaxPages] = useState<number | "">(5);
    const [resume, setResume] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    useEffect(() => {
        fetchLastSync();
    }, [fetchLastSync]);

    // Auto-resume sync after hard refresh if our session matches
    const autoResumeAttempted = useRef(false);
    useEffect(() => {
        if (autoResumeAttempted.current || isSyncing || !lastSync) return;
        const session = getActiveSyncSession();
        if (
            session &&
            lastSync.id === session.sync_log_id &&
            lastSync.status === "in_progress"
        ) {
            autoResumeAttempted.current = true;
            showToast("Resuming sync after page refresh...", true);
            if (session.sync_mode === "full") {
                runFullSync(session.max_pages, true, showToast);
            } else {
                runChangesSync(session.max_pages, true, showToast);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastSync]);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const isMaxPagesValid = maxPages === "" || (maxPages > 0 && maxPages <= 500);

    const handleTrigger = () => {
        if (syncMode === "full") {
            runFullSync(maxPages, resume, showToast);
        } else {
            runChangesSync(maxPages, resume, showToast);
        }
    };

    const handleStop = async () => {
        stopSync();
        showToast("Stopping sync after current batch completes...", true);

        const currentId = batchProgress?.sync_log_id || lastSync?.id;
        if (currentId) {
            const res = await useAdminSyncStore.getState().stopSyncApi(currentId);
            if (!res.success) {
                showToast(res.message, false);
            }
        }
    };

    const handleRefresh = () => {
        fetchLastSync();
    };

    // Determine if an in_progress sync belongs to another admin:
    // If sessionStorage has a matching sync_log_id, it's OUR sync (just refreshed).
    const isAnotherAdminSyncing =
        lastSync?.status === "in_progress" &&
        !isSyncing &&
        getActiveSyncLogId() !== lastSync.id;



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
                    <p className="mt-1 text-sm text-white/40">Frontend-driven batch sync with TMDB</p>
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

                {isAnotherAdminSyncing && (
                    <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-400">Sync is currently running</p>
                            <p className="mt-1 text-xs text-orange-400/80">
                                Another admin is currently running a TMDB sync. Please wait until it finishes before starting a new one.
                            </p>
                        </div>
                    </div>
                )}

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
                    <div title="Limit the number of pages synced per run. Empty means sync everything.">
                        <label className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-white/50">
                            <span>Max Pages</span>
                            {!isMaxPagesValid && <span className="normal-case tracking-normal text-red-400">1–500</span>}
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
                    {lastSync && lastSync.sync_type === syncMode && (lastSync.status === "failed" || lastSync.status === "in_progress" || lastSync.status === "stopped") && (
                        <label 
                            className="flex cursor-pointer items-center gap-2 text-sm text-white/60"
                            title={`Resume the previous ${lastSync.status} sync to continue from where it left off, accumulating stats in the same log.`}
                        >
                            <input
                                type="checkbox"
                                checked={resume}
                                onChange={(e) => setResume(e.target.checked)}
                                className="h-4 w-4 rounded accent-amber-500"
                            />
                            Resume {lastSync.status} sync
                        </label>
                    )}
                    <button
                        onClick={handleTrigger}
                        disabled={isSyncing || !isMaxPagesValid || isAnotherAdminSyncing}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        {isSyncing ? "Syncing…" : "Start Sync"}
                    </button>
                    {isSyncing && (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20"
                        >
                            <StopCircle className="h-4 w-4" />
                            Stop Sync
                        </button>
                    )}
                </div>
                <p className="mt-3 text-xs text-white/30">
                    {isSyncing
                        ? "⚡ Sync in progress — processing pages sequentially from TMDB."
                        : syncMode === "full"
                            ? "Full mode processes one page (~20 movies) per request. FE drives pagination until all pages are done."
                            : "Changes mode syncs updated movies from the last 14 days sequentially."}
                </p>
            </div>

            {/* Live Progress or Last Sync */}
            <div>
                {isSyncing && batchProgress ? (
                    <ProgressCard progress={batchProgress} logs={syncLogs} />
                ) : isSyncing && syncLogs.length > 0 ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                            <h2 className="text-base font-semibold text-white">Starting sync...</h2>
                        </div>
                        <div className="rounded-lg bg-black/30 p-3 max-h-48 overflow-y-auto">
                            <div className="space-y-0.5 font-mono text-xs text-white/60">
                                {syncLogs.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : isFetching && !lastSync ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    </div>
                ) : lastSync ? (
                    <SyncCard log={lastSync} />
                ) : (
                    <div className="flex justify-center py-12">
                        <p className="text-white/30">No sync data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
