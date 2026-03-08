import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { useMovieStore } from "@/stores/movieStore";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import MovieGrid from "@/components/movies/MovieGrid";
import Pagination from "@/components/shared/Pagination";

export default function MoviesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    const { fetchWishlists, wishlists } = useWishlistStore();

    const {
        movies,
        genres,
        pagination,
        isLoading,
        fetchMovies,
        fetchGenres,
    } = useMovieStore();

    // Derive filters from URL
    const filters = useMemo(
        () => ({
            search: searchParams.get("search") || undefined,
            genre_id: searchParams.get("genre_id") || undefined,
            sort: searchParams.get("sort") || "popularity",
            order: (searchParams.get("order") || "desc") as "asc" | "desc",
            page: Number(searchParams.get("page")) || 1,
            per_page: 20,
        }),
        [searchParams]
    );

    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    useEffect(() => {
        fetchMovies(filters);
    }, [filters, fetchMovies]);

    // Fetch wishlists for heart button state
    useEffect(() => {
        if (isAuthenticated && wishlists.length === 0) {
            fetchWishlists();
        }
    }, [isAuthenticated, fetchWishlists, wishlists.length]);

    const updateParam = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset page when changing filters
        if (key !== "page") {
            params.delete("page");
        }
        setSearchParams(params);
    };

    const handlePageChange = (page: number) => {
        updateParam("page", page.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Movies</h1>
                <p className="mt-1 text-white/50">
                    {pagination
                        ? `${pagination.total.toLocaleString()} movies found`
                        : "Browse our collection"}
                </p>
            </div>

            {/* Filters Bar */}
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <SlidersHorizontal className="h-4 w-4 text-white/40" />

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search..."
                    defaultValue={filters.search || ""}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value;
                            updateParam("search", val || null);
                        }
                    }}
                    className="h-9 w-44 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                />

                {/* Genre Select */}
                <select
                    value={filters.genre_id || ""}
                    onChange={(e) => updateParam("genre_id", e.target.value || null)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500/50 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={filters.sort}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500/50 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="release_date">Release Date</option>
                    <option value="title">Title</option>
                </select>

                {/* Order */}
                <select
                    value={filters.order}
                    onChange={(e) => updateParam("order", e.target.value)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500/50 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                </select>

                {/* Active filter count */}
                {(filters.search || filters.genre_id) && (
                    <button
                        onClick={() => setSearchParams({})}
                        className="ml-auto text-xs text-amber-500 hover:text-amber-400 transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Grid */}
            <MovieGrid movies={movies} isLoading={isLoading} />

            {/* Pagination */}
            <Pagination meta={pagination} onPageChange={handlePageChange} />
        </div>
    );
}
