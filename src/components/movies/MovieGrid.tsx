import MovieCard from "./MovieCard";
import type { Movie } from "@/types";

interface MovieGridProps {
    movies: Movie[];
    isLoading?: boolean;
}

function SkeletonCard() {
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 animate-pulse">
            <div className="aspect-[2/3] w-full bg-white/10" />
            <div className="flex flex-col gap-2 p-3">
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
        </div>
    );
}

export default function MovieGrid({ movies, isLoading }: MovieGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🎬</span>
                <p className="text-lg font-medium text-white/60">No movies found</p>
                <p className="text-sm text-white/30 mt-1">
                    Try adjusting your search or filters
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
    );
}
