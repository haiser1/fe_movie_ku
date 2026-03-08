import { Link } from "react-router-dom";
import { Star, Calendar, Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Movie } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import LoginPromptDialog from "@/components/shared/LoginPromptDialog";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const { isAuthenticated } = useAuthStore();
    const { isInWishlist, addToWishlist, removeFromWishlist, wishlists } =
        useWishlistStore();
    const [loginPrompt, setLoginPrompt] = useState(false);
    const [isWishing, setIsWishing] = useState(false);

    const poster = movie.images?.find((img) => img.image_type === "poster");
    const posterUrl = poster
        ? `${TMDB_IMAGE_BASE}/w500${poster.image_url}`
        : null;

    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : null;

    const wishlisted = isInWishlist(movie.id);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setLoginPrompt(true);
            return;
        }

        setIsWishing(true);
        if (wishlisted) {
            const item = wishlists.find((w) => w.movie_id === movie.id);
            if (item) await removeFromWishlist(item.id);
        } else {
            await addToWishlist({ movie_id: movie.id });
        }
        setIsWishing(false);
    };

    return (
        <>
            <Link
                to={`/movies/${movie.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 transition-all duration-300 hover:border-amber-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1"
            >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-white/5">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/20">
                            <span className="text-4xl">🎬</span>
                        </div>
                    )}

                    {/* Rating Badge */}
                    {movie.rating != null && movie.rating > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-semibold text-white">
                                {movie.rating.toFixed(1)}
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistToggle}
                        disabled={isWishing}
                        className={`absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${wishlisted
                                ? "bg-pink-500/80 text-white hover:bg-pink-500"
                                : "bg-black/50 text-white/60 hover:bg-black/70 hover:text-white"
                            }`}
                        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {isWishing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Heart
                                className={`h-4 w-4 ${wishlisted ? "fill-white" : ""}`}
                            />
                        )}
                    </button>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white group-hover:text-amber-400 transition-colors">
                        {movie.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-3 text-xs text-white/40">
                        {year && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {year}
                            </span>
                        )}
                        {movie.genres?.length > 0 && (
                            <span className="truncate">{movie.genres[0].name}</span>
                        )}
                    </div>
                </div>
            </Link>

            <LoginPromptDialog
                open={loginPrompt}
                onOpenChange={setLoginPrompt}
                message="Sign in to add movies to your wishlist."
            />
        </>
    );
}
