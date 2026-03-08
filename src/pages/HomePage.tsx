import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMovieStore } from "@/stores/movieStore";
import MovieCard from "@/components/movies/MovieCard";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export default function HomePage() {
    const {
        popularMovies,
        genres,
        isLoadingPopular,
        fetchPopularMovies,
        fetchGenres,
    } = useMovieStore();

    const [featuredIndex, setFeaturedIndex] = useState(0);

    useEffect(() => {
        fetchPopularMovies(1, 10);
        fetchGenres();
    }, [fetchPopularMovies, fetchGenres]);

    useEffect(() => {
        if (popularMovies.length === 0) return;
        const interval = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % Math.min(5, popularMovies.length));
        }, 5000); // Change backdrop every 5 seconds
        return () => clearInterval(interval);
    }, [popularMovies]);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative flex min-h-[70vh] items-center overflow-hidden">
                {/* Dynamic Sliding Backgrounds */}
                {popularMovies.slice(0, 5).map((movie, idx) => {
                    const backdrop = movie.images?.find((img) => img.image_type === "backdrop");
                    const url = backdrop ? `${TMDB_IMAGE_BASE}/w1280${backdrop.image_url}` : null;
                    if (!url) return null;
                    const isActive = idx === featuredIndex;

                    return (
                        <div
                            key={`bg-${movie.id}`}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-0" : "opacity-0 -z-10"}`}
                        >
                            <img
                                src={url}
                                alt=""
                                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[10000ms] ease-linear ${isActive ? "scale-105" : "scale-100"}`}
                            />
                        </div>
                    );
                })}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="max-w-2xl relative h-[300px]">
                        {popularMovies.slice(0, 5).map((movie, idx) => {
                            const isActive = idx === featuredIndex;
                            return (
                                <div
                                    key={`content-${movie.id}`}
                                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
                                >
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 shadow-xl shadow-amber-500/5 backdrop-blur-md transition-all hover:bg-amber-500/20">
                                        <Sparkles className="h-3 w-3" />
                                        Featured Movie
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                                        {movie.title}
                                    </h1>
                                    <p className="mt-4 line-clamp-3 max-w-lg text-base leading-relaxed text-white/80 drop-shadow sm:text-lg">
                                        {movie.overview || "Discover this amazing movie on MovieKu."}
                                    </p>
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            className="bg-amber-500 text-black hover:bg-amber-400 font-semibold px-6 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40"
                                        >
                                            <Link to={`/movies/${movie.id}`}>
                                                View Details
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {popularMovies.length === 0 && (
                            <div className="absolute inset-0">
                                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                                    Discover Your Next <span className="text-amber-500">Favorite Movie</span>
                                </h1>
                                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 drop-shadow sm:text-lg">
                                    Browse thousands of movies, save to your watchlist, and never miss a great film.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Button
                                        asChild
                                        className="bg-amber-500 text-black hover:bg-amber-400 font-semibold px-6 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40"
                                    >
                                        <Link to="/movies">
                                            Explore Movies
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Navigation Dots */}
                    {popularMovies.length > 0 && (
                        <div className="absolute bottom-[-40px] left-4 flex gap-2 sm:left-6 lg:left-8">
                            {popularMovies.slice(0, 5).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setFeaturedIndex(idx)}
                                    className={`h-2 rounded-full transition-all duration-500 ${idx === featuredIndex ? "w-8 bg-amber-500" : "w-2 bg-white/30 hover:bg-white/50"}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Popular Movies */}
            <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                            Popular Movies
                        </h2>
                    </div>
                    <Link
                        to="/movies?sort=popularity&order=desc"
                        className="flex items-center gap-1 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {isLoadingPopular ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 animate-pulse"
                            >
                                <div className="aspect-[2/3] bg-white/10" />
                                <div className="flex flex-col gap-2 p-3">
                                    <div className="h-4 w-3/4 rounded bg-white/10" />
                                    <div className="h-3 w-1/2 rounded bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {popularMovies.slice(0, 10).map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </section>

            {/* Browse by Genre */}
            {genres.length > 0 && (
                <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">
                        Browse by Genre
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                            <Link
                                key={genre.id}
                                to={`/movies?genre_id=${genre.id}`}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                            >
                                {genre.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
