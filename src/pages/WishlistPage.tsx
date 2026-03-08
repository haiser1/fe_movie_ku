import { useEffect, useState } from "react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { Heart, Trash2, Calendar, Star, Loader2, Film, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${ok ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
            {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg}
        </div>
    );
}

export default function WishlistPage() {
    const { wishlists, isLoading, fetchWishlists, removeFromWishlist } =
        useWishlistStore();
    const { user } = useAuthStore();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

    useEffect(() => {
        fetchWishlists();
    }, [fetchWishlists]);

    const handleRemove = async (id: string) => {
        setRemovingId(id);
        const result = await removeFromWishlist(id);
        setRemovingId(null);
        showToast(result.message, result.success);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Heart className="h-8 w-8 text-amber-500 fill-amber-500" />
                        My Wishlist
                    </h1>
                    <p className="mt-1 text-white/50">
                        Movies you want to watch, {user?.name}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/my-movies">
                        <Button
                            variant="outline"
                            className="border-white/10 text-white/70 hover:bg-white/5 hover:text-white gap-2"
                        >
                            <Film className="h-4 w-4" />
                            My Movies
                        </Button>
                    </Link>
                    <Link to="/movies">
                        <Button className="bg-amber-500 text-black font-semibold hover:bg-amber-400 gap-2">
                            Browse Movies
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && wishlists.length === 0 && (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                        <Heart className="h-10 w-10 text-white/20" />
                    </div>
                    <h2 className="text-xl font-semibold text-white/60">
                        Your wishlist is empty
                    </h2>
                    <p className="text-sm text-white/40 text-center max-w-md">
                        Start browsing movies and add them to your wishlist to
                        keep track of what you want to watch.
                    </p>
                    <Link to="/movies">
                        <Button className="mt-2 bg-amber-500 text-black font-semibold hover:bg-amber-400">
                            Browse Movies
                        </Button>
                    </Link>
                </div>
            )}

            {/* Wishlist Grid */}
            {!isLoading && wishlists.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlists.map((item) => {
                        const movie = item.movie;
                        if (!movie) return null;

                        const poster = movie.images?.find(
                            (img) => img.image_type === "poster"
                        );
                        const posterUrl = poster
                            ? `${TMDB_IMAGE_BASE}/w342${poster.image_url}`
                            : null;
                        const year = movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : null;

                        return (
                            <div
                                key={item.id}
                                className="group relative flex overflow-hidden rounded-xl border border-white/5 bg-white/5 transition-all hover:border-amber-500/20 hover:bg-white/[0.07]"
                            >
                                {/* Poster */}
                                <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden bg-white/5">
                                    {posterUrl ? (
                                        <img
                                            src={posterUrl}
                                            alt={movie.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl text-white/20">
                                            🎬
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-1 flex-col justify-between p-3">
                                    <div>
                                        <Link
                                            to={`/movies/${movie.id}`}
                                            className="line-clamp-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                                        >
                                            {movie.title}
                                        </Link>
                                        <div className="mt-1.5 flex items-center gap-2 text-xs text-white/40">
                                            {movie.rating != null && (
                                                <span className="flex items-center gap-0.5">
                                                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                    {movie.rating.toFixed(1)}
                                                </span>
                                            )}
                                            {year && (
                                                <span className="flex items-center gap-0.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {year}
                                                </span>
                                            )}
                                        </div>
                                        {movie.genres?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {movie.genres
                                                    .slice(0, 2)
                                                    .map((g) => (
                                                        <span
                                                            key={g.id}
                                                            className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                                                        >
                                                            {g.name}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-2 flex items-center justify-between">
                                        {item.scheduled_watch_date && (
                                            <span className="text-[10px] text-amber-500/70">
                                                📅{" "}
                                                {new Date(
                                                    item.scheduled_watch_date
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemove(item.id)
                                            }
                                            disabled={
                                                removingId === item.id
                                            }
                                            className="ml-auto h-7 gap-1 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        >
                                            {removingId === item.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3 w-3" />
                                            )}
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
