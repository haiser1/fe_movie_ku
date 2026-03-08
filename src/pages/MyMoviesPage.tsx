import { useEffect, useState } from "react";
import { useUserMovieStore } from "@/stores/userMovieStore";
import { useAuthStore } from "@/stores/authStore";
import MovieFormDialog from "@/components/movies/MovieFormDialog";
import {
    Plus,
    Pencil,
    Trash2,
    Film,
    Loader2,
    Calendar,
    Heart,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Movie, MovieCreateRequest, MovieUpdateRequest } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${ok ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
            {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg}
        </div>
    );
}

export default function MyMoviesPage() {
    const { myMovies, isLoading, isSaving, fetchMyMovies, createMovie, updateMovie, deleteMovie } =
        useUserMovieStore();
    const { user } = useAuthStore();

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Movie | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

    useEffect(() => {
        fetchMyMovies();
    }, [fetchMyMovies]);

    const openCreate = () => {
        setFormMode("create");
        setEditingMovie(null);
        setFormOpen(true);
    };

    const openEdit = (movie: Movie) => {
        setFormMode("edit");
        setEditingMovie(movie);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data: MovieCreateRequest | MovieUpdateRequest) => {
        let result: { success: boolean; message: string };
        if (formMode === "create") {
            result = await createMovie(data as MovieCreateRequest);
        } else if (editingMovie) {
            result = await updateMovie(editingMovie.id, data);
        } else {
            return false;
        }

        if (result.success) {
            setFormOpen(false);
            setEditingMovie(null);
        }
        showToast(result.message, result.success);
        return result.success;
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeletingId(deleteConfirm.id);
        const result = await deleteMovie(deleteConfirm.id);
        setDeletingId(null);
        if (result.success) setDeleteConfirm(null);
        showToast(result.message, result.success);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Film className="h-8 w-8 text-amber-500" />
                        My Movies
                    </h1>
                    <p className="mt-1 text-white/50">
                        Movies created by you, {user?.name}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/wishlist">
                        <Button
                            variant="outline"
                            className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white gap-2"
                        >
                            <Heart className="h-4 w-4" />
                            Wishlist
                        </Button>
                    </Link>
                    <Button
                        onClick={openCreate}
                        className="bg-amber-500 text-black font-semibold hover:bg-amber-400 gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Movie
                    </Button>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && myMovies.length === 0 && (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                        <Film className="h-10 w-10 text-white/20" />
                    </div>
                    <h2 className="text-xl font-semibold text-white/60">
                        No movies yet
                    </h2>
                    <p className="text-sm text-white/40 text-center max-w-md">
                        Start creating your own movie entries. Your movies will appear here.
                    </p>
                    <Button
                        onClick={openCreate}
                        className="mt-2 bg-amber-500 text-black font-semibold hover:bg-amber-400 gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Your First Movie
                    </Button>
                </div>
            )}

            {/* Movies Table */}
            {!isLoading && myMovies.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-white/5">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">
                                    Movie
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50 sm:table-cell">
                                    Release Date
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50 md:table-cell">
                                    Genres
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/50">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {myMovies.map((movie) => (
                                <tr
                                    key={movie.id}
                                    className="transition-colors hover:bg-white/[0.03]"
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <Link
                                                to={`/movies/${movie.id}`}
                                                className="text-sm font-medium text-white hover:text-amber-400 transition-colors"
                                            >
                                                {movie.title}
                                            </Link>
                                            {movie.overview && (
                                                <p className="mt-0.5 text-xs text-white/40 line-clamp-1">
                                                    {movie.overview}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 sm:table-cell">
                                        <span className="flex items-center gap-1 text-xs text-white/40">
                                            <Calendar className="h-3 w-3" />
                                            {movie.release_date
                                                ? new Date(
                                                    movie.release_date
                                                ).toLocaleDateString()
                                                : "—"}
                                        </span>
                                    </td>
                                    <td className="hidden px-4 py-3 md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {movie.genres
                                                ?.slice(0, 3)
                                                .map((g) => (
                                                    <span
                                                        key={g.id}
                                                        className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                                                    >
                                                        {g.name}
                                                    </span>
                                                ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    openEdit(movie)
                                                }
                                                className="h-8 w-8 p-0 text-white/40 hover:text-amber-400 hover:bg-amber-500/10"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setDeleteConfirm(movie)
                                                }
                                                className="h-8 w-8 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Movie Form Dialog */}
            <MovieFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                mode={formMode}
                movie={editingMovie}
                onSubmit={handleFormSubmit}
                isSaving={isSaving}
            />

            {/* Delete Confirmation */}
            <Dialog
                open={!!deleteConfirm}
                onOpenChange={(open) => !open && setDeleteConfirm(null)}
            >
                <DialogContent className="border-white/10 bg-[oklch(0.14_0.02_260)] sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Delete Movie
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Are you sure you want to delete "
                            {deleteConfirm?.title}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                            className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={!!deletingId}
                            className="bg-red-500 text-white font-semibold hover:bg-red-600 gap-2"
                        >
                            {deletingId && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
