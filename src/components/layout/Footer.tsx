import { Film } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500">
                            <Film className="h-4 w-4 text-black" />
                        </div>
                        <span className="text-sm font-semibold text-white">
                            Movie<span className="text-amber-500">Ku</span>
                        </span>
                    </div>
                    <p className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} MovieKu. Built with TMDB API.
                    </p>
                </div>
            </div>
        </footer>
    );
}
