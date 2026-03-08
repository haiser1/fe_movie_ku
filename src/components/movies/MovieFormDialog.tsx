import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useMovieStore } from "@/stores/movieStore";
import type { MovieCreateRequest, MovieUpdateRequest, Movie, Genre } from "@/types";

interface MovieFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    movie?: Movie | null;
    onSubmit: (data: MovieCreateRequest | MovieUpdateRequest) => Promise<boolean>;
    isSaving: boolean;
}

export default function MovieFormDialog({
    open,
    onOpenChange,
    mode,
    movie,
    onSubmit,
    isSaving,
}: MovieFormDialogProps) {
    const { genres, fetchGenres } = useMovieStore();
    const [title, setTitle] = useState("");
    const [overview, setOverview] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    useEffect(() => {
        if (genres.length === 0) fetchGenres();
    }, [genres.length, fetchGenres]);

    useEffect(() => {
        if (mode === "edit" && movie) {
            setTitle(movie.title);
            setOverview(movie.overview || "");
            setReleaseDate(movie.release_date || "");
            setSelectedGenres(movie.genres?.map((g) => g.id) || []);
        } else {
            setTitle("");
            setOverview("");
            setReleaseDate("");
            setSelectedGenres([]);
        }
    }, [mode, movie, open]);

    const toggleGenre = (genreId: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const data: MovieCreateRequest = {
            title: title.trim(),
            overview: overview.trim() || undefined,
            release_date: releaseDate || undefined,
            genre_ids: selectedGenres.length > 0 ? selectedGenres : undefined,
        };

        const success = await onSubmit(data);
        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-white/10 bg-[oklch(0.14_0.02_260)] sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        {mode === "create" ? "Add New Movie" : "Edit Movie"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter movie title"
                            required
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                        />
                    </div>

                    {/* Overview */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">
                            Overview
                        </label>
                        <textarea
                            value={overview}
                            onChange={(e) => setOverview(e.target.value)}
                            placeholder="Brief description of the movie..."
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 resize-none"
                        />
                    </div>

                    {/* Release Date */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">
                            Release Date
                        </label>
                        <Input
                            type="date"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className="border-white/10 bg-white/5 text-white [color-scheme:dark]"
                        />
                    </div>

                    {/* Genres */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">
                            Genres
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3">
                            {genres.map((genre: Genre) => (
                                <button
                                    key={genre.id}
                                    type="button"
                                    onClick={() => toggleGenre(genre.id)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${selectedGenres.includes(genre.id)
                                            ? "bg-amber-500 text-black"
                                            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                                        }`}
                                >
                                    {genre.name}
                                </button>
                            ))}
                            {genres.length === 0 && (
                                <span className="text-xs text-white/30">
                                    Loading genres...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || isSaving}
                            className="bg-amber-500 text-black font-semibold hover:bg-amber-400 gap-2"
                        >
                            {isSaving && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {mode === "create" ? "Add Movie" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
