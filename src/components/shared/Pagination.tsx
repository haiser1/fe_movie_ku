import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
    meta: PaginationMeta | null;
    onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
    if (!meta || meta.total_pages <= 1) return null;

    const { page, total_pages } = meta;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        const delta = 2;

        for (let i = 1; i <= total_pages; i++) {
            if (
                i === 1 ||
                i === total_pages ||
                (i >= page - delta && i <= page + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 py-8">
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((p, idx) =>
                p === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-white/30 text-sm">
                        ...
                    </span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="icon"
                        className={`h-9 w-9 text-sm ${p === page
                                ? "bg-amber-500 text-black hover:bg-amber-400 border-amber-500"
                                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30"
                disabled={page >= total_pages}
                onClick={() => onPageChange(page + 1)}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
