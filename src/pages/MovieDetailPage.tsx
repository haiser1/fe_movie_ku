import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Star,
    Calendar,
    TrendingUp,
    Clock,
    Play,
    Heart,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMovieStore } from "@/stores/movieStore";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import LoginPromptDialog from "@/components/shared/LoginPromptDialog";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export default function MovieDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { currentMovie, isLoadingDetail, fetchMovieDetail, clearCurrentMovie } =
        useMovieStore();
    const { isAuthenticated } = useAuthStore();
    const { isInWishlist, addToWishlist, removeFromWishlist, wishlists } =
        useWishlistStore();
    const [loginPrompt, setLoginPrompt] = useState(false);
    const [isWishing, setIsWishing] = useState(false);

    useEffect(() => {
        if (id) fetchMovieDetail(id);
        return () => clearCurrentMovie();
    }, [id, fetchMovieDetail, clearCurrentMovie]);

    // Ensure wishlists are loaded for toggle state
    useEffect(() => {
        if (isAuthenticated && wishlists.length === 0) {
            useWishlistStore.getState().fetchWishlists();
        }
    }, [isAuthenticated, wishlists.length]);

    if (isLoadingDetail) {
        return (
            <div className="animate-pulse">
                <div className="h-[50vh] bg-white/5" />
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="h-10 w-80 rounded bg-white/10 mb-4" />
                    <div className="h-4 w-full max-w-xl rounded bg-white/10 mb-2" />
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                </div>
            </div>
        );
    }

    if (!currentMovie) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <span className="text-5xl mb-4">😕</span>
                <p className="text-xl font-medium text-white/60">Movie not found</p>
                <Button asChild variant="outline" className="mt-6 border-white/20 text-white">
                    <Link to="/movies">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Movies
                    </Link>
                </Button>
            </div>
        );
    }

    const movie = currentMovie;
    const backdrop = movie.images?.find((img) => img.image_type === "backdrop");
    const poster = movie.images?.find((img) => img.image_type === "poster");
    const backdropUrl = backdrop
        ? `${TMDB_IMAGE_BASE}/w1280${backdrop.image_url}`
        : null;
    const posterUrl = poster
        ? `${TMDB_IMAGE_BASE}/w500${poster.image_url}`
        : null;

    const trailer = movie.videos?.find(
        (v) => v.video_type === "trailer" && v.site === "youtube"
    );
    const teaser = movie.videos?.find(
        (v) => v.video_type === "teaser" && v.site === "youtube"
    );
    const mainVideo = trailer || teaser;

    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : null;

    const wishlisted = isInWishlist(movie.id);

    const handleWishlistToggle = async () => {
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
        <div className="flex flex-col">
            {/* Backdrop Hero */}
            <section className="relative flex min-h-[55vh] items-end overflow-hidden">
                {backdropUrl && (
                    <img
                        src={backdropUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-top"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

                <div className="relative mx-auto flex w-full max-w-7xl gap-8 px-4 pb-8 pt-32 sm:px-6 lg:px-8">
                    {/* Poster */}
                    {posterUrl && (
                        <div className="hidden shrink-0 sm:block">
                            <img
                                src={posterUrl}
                                alt={movie.title}
                                className="w-48 rounded-xl border border-white/10 shadow-2xl lg:w-56"
                            />
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex flex-col justify-end">
                        <Link
                            to="/movies"
                            className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Movies
                        </Link>
                        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                            {movie.title}
                        </h1>

                        {/* Meta */}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/60">
                            {movie.rating != null && movie.rating > 0 && (
                                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                    <Star className="h-4 w-4 fill-amber-500" />
                                    {movie.rating.toFixed(1)}
                                </span>
                            )}
                            {year && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {year}
                                </span>
                            )}
                            {movie.popularity != null && (
                                <span className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    {movie.popularity.toFixed(0)} popularity
                                </span>
                            )}
                            <span className="flex items-center gap-1 capitalize">
                                <Clock className="h-4 w-4" />
                                {movie.source}
                            </span>
                        </div>

                        {/* Genres */}
                        {movie.genres?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {movie.genres.map((genre) => (
                                    <Link
                                        key={genre.id}
                                        to={`/movies?genre_id=${genre.id}`}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-amber-500/30 hover:text-amber-400"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Wishlist Button */}
                        <div className="mt-5">
                            <Button
                                onClick={handleWishlistToggle}
                                disabled={isWishing}
                                className={`gap-2 font-semibold transition-all ${wishlisted
                                    ? "bg-pink-500 text-white hover:bg-pink-600"
                                    : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                                    }`}
                            >
                                {isWishing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Heart
                                        className={`h-4 w-4 ${wishlisted ? "fill-white" : ""}`}
                                    />
                                )}
                                {wishlisted
                                    ? "In Wishlist"
                                    : "Add to Wishlist"}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Left: Overview + Trailer */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Overview */}
                        {movie.overview && (
                            <div>
                                <h2 className="mb-3 text-lg font-bold text-white">Overview</h2>
                                <p className="leading-relaxed text-white/60">{movie.overview}</p>
                            </div>
                        )}

                        {/* Trailer */}
                        {mainVideo && (
                            <div>
                                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                                    <Play className="h-5 w-5 text-amber-500" />
                                    {mainVideo.video_type === "trailer" ? "Trailer" : "Teaser"}
                                </h2>
                                <div className="aspect-video overflow-hidden rounded-xl border border-white/10">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${mainVideo.video_key}`}
                                        title={`${movie.title} ${mainVideo.video_type}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="h-full w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Additional Info */}
                    <div className="space-y-6">
                        {/* Movie Details Card */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/40">
                                Details
                            </h3>
                            <dl className="space-y-3 text-sm">
                                {movie.release_date && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">Release Date</dt>
                                        <dd className="text-white">
                                            {new Date(movie.release_date).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-white/40">Source</dt>
                                    <dd className="capitalize text-white">{movie.source}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-white/40">Status</dt>
                                    <dd className="capitalize text-white">{movie.status}</dd>
                                </div>
                                {movie.api_id && (
                                    <div className="flex justify-between">
                                        <dt className="text-white/40">TMDB ID</dt>
                                        <dd>
                                            <a
                                                href={`https://www.themoviedb.org/movie/${movie.api_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-amber-500 hover:text-amber-400 transition-colors"
                                            >
                                                {movie.api_id}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Gallery */}
                        {movie.images?.filter((i) => i.image_type === "backdrop").length >
                            1 && (
                                <div>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/40">
                                        Gallery
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {movie.images
                                            .filter((img) => img.image_type === "backdrop")
                                            .slice(0, 4)
                                            .map((img) => (
                                                <img
                                                    key={img.id}
                                                    src={`${TMDB_IMAGE_BASE}/w780${img.image_url}`}
                                                    alt=""
                                                    className="rounded-lg border border-white/10 object-cover aspect-video"
                                                    loading="lazy"
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </section>

            {/* Login Prompt */}
            <LoginPromptDialog
                open={loginPrompt}
                onOpenChange={setLoginPrompt}
                message="Sign in to add this movie to your wishlist."
            />
        </div>
    );
}
