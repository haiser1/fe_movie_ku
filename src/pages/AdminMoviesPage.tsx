import { useEffect, useState } from "react";
import { useAdminMovieStore } from "@/stores/adminMovieStore";
import type { Movie, AdminMovieCreateRequest, AdminMovieUpdateRequest } from "@/types";
import {
    Film, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight,
    Loader2, X, CheckCircle2, XCircle, Star, ChevronUp, ChevronDown, ArrowUpDown, RefreshCcw
} from "lucide-react";

// ─── Toast ──────────────────────────────────────────────────────────────
function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${ok ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
            {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg}
        </div>
    );
}

// ─── Movie Form Dialog ───────────────────────────────────────────────────
interface MovieFormProps {
    initial?: Movie | null;
    onClose: () => void;
    onSubmit: (data: AdminMovieCreateRequest | AdminMovieUpdateRequest) => Promise<void>;
    isSaving: boolean;
}
function MovieDialog({ initial, onClose, onSubmit, isSaving }: MovieFormProps) {
    const [form, setForm] = useState<AdminMovieCreateRequest>({
        title: initial?.title ?? "",
        overview: initial?.overview ?? "",
        release_date: initial?.release_date ?? "",
        popularity: initial?.popularity ?? undefined,
        rating: initial?.rating ?? undefined,
        is_featured: initial?.is_featured ?? false,
        status: initial?.status ?? "active",
        genre_ids: initial?.genres.map((g) => g.id) ?? [],
    });

    const set = (field: string, value: unknown) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <h2 className="text-base font-semibold text-white">
                        {initial ? "Edit Movie" : "Create Movie"}
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="label-sm">Title *</label>
                        <input value={form.title} onChange={(e) => set("title", e.target.value)} required
                            className="input-field mt-1.5" placeholder="Movie title" />
                    </div>
                    <div>
                        <label className="label-sm">Overview</label>
                        <textarea value={form.overview} onChange={(e) => set("overview", e.target.value)} rows={3}
                            className="input-field mt-1.5 resize-none" placeholder="Short description…" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-sm">Release Date</label>
                            <input type="date" value={form.release_date ?? ""} onChange={(e) => set("release_date", e.target.value)}
                                className="input-field mt-1.5 [color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="label-sm">Status</label>
                            <select value={form.status} onChange={(e) => set("status", e.target.value)}
                                className="input-field mt-1.5 [&>option]:bg-neutral-900">
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-sm">Popularity</label>
                            <input type="number" step="0.01" value={form.popularity ?? ""} onChange={(e) => set("popularity", e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="input-field mt-1.5" placeholder="e.g. 85.4" />
                        </div>
                        <div>
                            <label className="label-sm">Rating (0–10)</label>
                            <input type="number" step="0.01" min="0" max="10" value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="input-field mt-1.5" placeholder="e.g. 7.8" />
                        </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60 select-none">
                        <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)}
                            className="h-4 w-4 rounded accent-amber-500" />
                        Featured movie
                    </label>

                    <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                        <button type="button" onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm text-white/50 transition-colors hover:text-white">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-60">
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {initial ? "Save Changes" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────
export default function AdminMoviesPage() {
    const { movies, pagination, isLoading, fetchMovies, createMovie, updateMovie, deleteMovie, reactivateMovie } = useAdminMovieStore();

    const [search, setSearch] = useState("");
    const [source, setSource] = useState<"" | "tmdb" | "user" | "admin">("");
    const [status, setStatus] = useState<"" | "active" | "archived">("");
    const [sort, setSort] = useState<string>("created_at");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Movie | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Movie | null>(null);
    const [confirmReactivate, setConfirmReactivate] = useState<Movie | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

    const load = (p = page) => fetchMovies({ search, source, status, sort, order, page: p, per_page: PER_PAGE });

    useEffect(() => { load(1); setPage(1); }, [search, source, status, sort, order]);

    const handleSort = (field: string) => {
        if (sort === field) {
            setOrder(order === "asc" ? "desc" : "asc");
        } else {
            setSort(field);
            setOrder("asc");
        }
    };

    const handleSave = async (data: AdminMovieCreateRequest | AdminMovieUpdateRequest) => {
        setIsSaving(true);
        let result: { success: boolean; message: string };
        if (editing) {
            result = await updateMovie(editing.id, data);
        } else {
            result = await createMovie(data as AdminMovieCreateRequest);
        }
        setIsSaving(false);
        if (result.success) {
            setDialogOpen(false);
            setEditing(null);
        }
        showToast(result.message, result.success);
    };

    const handleDelete = async (movie: Movie) => {
        const result = await deleteMovie(movie.id);
        if (result.success) setConfirmDelete(null);
        showToast(result.message, result.success);
        load();
    };

    const handleReactivate = async (movie: Movie) => {
        const result = await reactivateMovie(movie.id);
        if (result.success) setConfirmReactivate(null);
        showToast(result.message, result.success);
        load();
    };

    const openCreate = () => { setEditing(null); setDialogOpen(true); };
    const openEdit = (m: Movie) => { setEditing(m); setDialogOpen(true); };

    const changePage = (p: number) => { setPage(p); fetchMovies({ search, source, status, sort, order, page: p, per_page: PER_PAGE }); };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Film className="h-6 w-6 text-amber-500" /> Movie Management
                    </h1>
                    <p className="mt-0.5 text-sm text-white/40">
                        {pagination ? `${pagination.total.toLocaleString()} movies total` : "All movies"}
                    </p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
                    <Plus className="h-4 w-4" /> Add Movie
                </button>
            </div>

            {/* Filters */}
            <div className="mb-5 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies…"
                        className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/50" />
                </div>
                <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/70 [&>option]:bg-neutral-900 outline-none">
                    <option value="">All Sources</option>
                    <option value="tmdb">TMDB</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/70 [&>option]:bg-neutral-900 outline-none">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-white/5 bg-white/5">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    </div>
                ) : movies.length === 0 ? (
                    <div className="py-16 text-center text-sm text-white/30">No movies found</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs font-medium uppercase tracking-wider text-white/30">
                                <th className="px-4 py-3 text-left cursor-pointer hover:text-white transition-colors group/th" onClick={() => handleSort("title")}>
                                    <div className="flex items-center gap-1">Title {sort === "title" ? (order === "asc" ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
                                </th>
                                <th className="px-4 py-3 text-left hidden sm:table-cell cursor-pointer hover:text-white transition-colors group/th" onClick={() => handleSort("source")}>
                                    <div className="flex items-center gap-1">Source {sort === "source" ? (order === "asc" ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
                                </th>
                                <th className="px-4 py-3 text-left hidden md:table-cell">Status</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell cursor-pointer hover:text-white transition-colors group/th" onClick={() => handleSort("rating")}>
                                    <div className="flex items-center gap-1">Rating {sort === "rating" ? (order === "asc" ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
                                </th>
                                <th className="px-4 py-3 text-left hidden xl:table-cell cursor-pointer hover:text-white transition-colors group/th" onClick={() => handleSort("created_at")}>
                                    <div className="flex items-center gap-1">Created {sort === "created_at" ? (order === "asc" ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
                                </th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {movies.map((m) => (
                                <tr key={m.id} className="group transition-colors hover:bg-white/[0.03]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/5">
                                                <Film className="h-4 w-4 text-white/30" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-white max-w-[180px] lg:max-w-xs">
                                                    {m.title}
                                                </p>
                                                {m.is_featured && (
                                                    <span className="text-[10px] text-amber-400 font-medium">Featured</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${m.source === "tmdb" ? "bg-amber-500/15 text-amber-400" :
                                            m.source === "user" ? "bg-blue-500/15 text-blue-400" :
                                                "bg-purple-500/15 text-purple-400"}`}>
                                            {m.source}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${m.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {m.rating != null ? (
                                            <span className="flex items-center gap-1 text-yellow-400">
                                                <Star className="h-3 w-3" />
                                                {m.rating.toFixed(1)}
                                            </span>
                                        ) : <span className="text-white/20">—</span>}
                                    </td>
                                    <td className="px-4 py-3 hidden xl:table-cell text-white/30 text-xs">
                                        {new Date(m.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {m.status === "archived" ? (
                                                <button onClick={() => setConfirmReactivate(m)}
                                                    className="rounded-lg p-1.5 text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Reactivate movie">
                                                    <RefreshCcw className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => openEdit(m)}
                                                        className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(m)}
                                                        className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-white/30">
                        Page {pagination.page} of {pagination.total_pages}
                    </p>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => changePage(page - 1)}
                            className="rounded-lg p-2 text-white/40 hover:bg-white/5 disabled:opacity-30">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button disabled={page >= pagination.total_pages} onClick={() => changePage(page + 1)}
                            className="rounded-lg p-2 text-white/40 hover:bg-white/5 disabled:opacity-30">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Dialog */}
            {dialogOpen && (
                <MovieDialog
                    initial={editing}
                    onClose={() => { setDialogOpen(false); setEditing(null); }}
                    onSubmit={handleSave}
                    isSaving={isSaving}
                />
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] p-6 shadow-2xl">
                        <h2 className="text-base font-semibold text-white">Archive Movie?</h2>
                        <p className="mt-2 text-sm text-white/50">
                            "{confirmDelete.title}" will be archived. This will hide it from normal users.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400">Archive</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reactivate Confirm */}
            {confirmReactivate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] p-6 shadow-2xl">
                        <h2 className="text-base font-semibold text-white">Reactivate Movie?</h2>
                        <p className="mt-2 text-sm text-white/50">
                            "{confirmReactivate.title}" will be restored to active status and visible to users.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setConfirmReactivate(null)}
                                className="rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                            <button onClick={() => handleReactivate(confirmReactivate)}
                                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400">Reactivate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
