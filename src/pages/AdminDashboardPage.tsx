import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { ApiResponse, DashboardAnalytics } from "@/types";
import {
    Film,
    Users,
    Heart,
    Star,
    Loader2,
    BarChart3,
    TrendingUp,
    Activity,
    Calendar,
    RefreshCw,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

const GENRE_COLORS = [
    "#f59e0b", "#3b82f6", "#ec4899", "#10b981", "#8b5cf6",
    "#ef4444", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];
const SOURCE_COLORS: Record<string, string> = { tmdb: "#f59e0b", user: "#3b82f6", admin: "#8b5cf6" };
const STATUS_COLORS: Record<string, string> = {
    active: "#10b981", inactive: "#ef4444", archived: "#6b7280",
    success: "#10b981", failed: "#ef4444", pending: "#f59e0b",
};
const COLUMN_COLORS = { movies: "#f59e0b", users: "#3b82f6", wishlists: "#ec4899", rating: "#8b5cf6" };

function PieTooltipContent({ active, payload, apiData }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
    apiData: Array<{ label: string; value: number; percentage: number }>;
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const item = apiData.find((x) => x.label === d.name);
    const pct = item != null ? item.percentage : 0;
    return (
        <div className="rounded-lg border border-white/10 bg-[oklch(0.14_0.02_260)] px-3 py-2 shadow-xl">
            <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.payload.fill }} />
                <span className="text-sm font-medium text-white">{d.name}</span>
            </div>
            <p className="mt-1 text-xs text-white/60">
                <span className="font-semibold text-white">{d.value.toLocaleString()}</span> ({pct}%)
            </p>
        </div>
    );
}

function BarTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-white/10 bg-[oklch(0.14_0.02_260)] px-3 py-2 shadow-xl">
            <p className="text-xs text-white/50 mb-1">{label}</p>
            <p className="text-sm font-semibold text-white">{payload[0].value.toLocaleString()}</p>
        </div>
    );
}

function PieChartCard({ title, icon: Icon, data, colors }: { title: string; icon: typeof Film; data: Array<{ label: string; value: number; percentage: number }>; colors: string[] | Record<string, string> }) {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const getColor = (idx: number, label: string) => Array.isArray(colors) ? colors[idx % colors.length] : (colors[label] || "#6b7280");
    const chartData = data.map((d, i) => ({ name: d.label, value: d.value, fill: getColor(i, d.label) }));

    return (
        <div className="rounded-xl border border-white/5 bg-white/5 p-6">
            <h2 className="mb-4 text-base font-semibold text-white flex items-center gap-2">
                <Icon className="h-4 w-4 text-amber-500" />{title}
            </h2>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-44 w-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none"
                                onMouseEnter={(_, idx) => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)}>
                                {chartData.map((entry, idx) => (
                                    <Cell key={entry.name} fill={entry.fill} opacity={activeIdx === null || activeIdx === idx ? 1 : 0.3} style={{ transition: "opacity 150ms" }} />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltipContent apiData={data} />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 min-w-0 max-h-40 overflow-y-auto pr-1">
                    {chartData.map((d, i) => {
                        const pct = data[i].percentage;
                        return (
                            <div key={d.name} className={`flex items-center justify-between rounded-md px-2 py-1 cursor-default transition-colors ${activeIdx === i ? "bg-white/5" : ""}`}
                                onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                                    <span className="text-xs text-white/70 truncate capitalize">{d.name}</span>
                                </div>
                                <span className="text-xs text-white/40 tabular-nums ml-2 flex-shrink-0">{d.value.toLocaleString()} ({pct}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ColumnChartCard({ title, icon: Icon, data, barColor, dataKey = "count", xKey = "date", formatX }: {
    title: string; icon: typeof Film; data: Array<Record<string, string | number>>; barColor: string;
    dataKey?: string; xKey?: string; formatX?: (v: string) => string;
}) {
    const fmtX = formatX ?? ((v: string) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}`; });
    return (
        <div className="rounded-xl border border-white/5 bg-white/5 p-6">
            <h2 className="mb-4 text-base font-semibold text-white flex items-center gap-2">
                <Icon className="h-4 w-4 text-amber-500" />{title}
            </h2>
            {data.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No data available</p>
            ) : (
                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey={xKey} tickFormatter={fmtX} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<BarTooltipContent />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// Compute default date range: last 30 days
function getDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
    };
}

export default function AdminDashboardPage() {
    const defaults = getDefaultDates();
    const [startDate, setStartDate] = useState(defaults.start);
    const [endDate, setEndDate] = useState(defaults.end);
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboard = async (start: string, end: string) => {
        setIsLoading(true);
        try {
            const { data } = await api.get<ApiResponse<DashboardAnalytics>>(
                "/api/admin/dashboard",
                { params: { start_date: start, end_date: end } }
            );
            setAnalytics(data.data);
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(startDate, endDate); }, []);

    const handleApplyFilter = () => fetchDashboard(startDate, endDate);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }
    if (!analytics) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-white/50">Failed to load dashboard</p>
            </div>
        );
    }

    const { summary, column_charts, pie_charts } = analytics;

    const statCards = [
        { label: "Total Movies", value: summary.total_movies, icon: Film, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Total Users", value: summary.total_users, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Total Wishlists", value: summary.total_wishlists, icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10" },
        { label: "Avg Rating", value: summary.average_rating, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", decimal: true },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header + Date Filter */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-amber-500" />
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-white/40">Analytics overview</p>
                </div>

                {/* Date Range Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <Calendar className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs text-white outline-none [color-scheme:dark]"
                        />
                    </div>
                    <span className="text-xs text-white/30">to</span>
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <Calendar className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs text-white outline-none [color-scheme:dark]"
                        />
                    </div>
                    <button
                        onClick={handleApplyFilter}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-amber-400"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Apply
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:border-white/10 hover:bg-white/[0.07]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-white/50">{s.label}</p>
                                <p className="mt-2 text-3xl font-bold text-white">
                                    {s.decimal ? s.value.toFixed(2) : s.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Info */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">Top Genre</p>
                        <p className="text-lg font-semibold text-white">{summary.top_genre}</p>
                    </div>
                </div>
                {summary.latest_movie && (
                    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Activity className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-white/40 uppercase tracking-wider">Latest Movie</p>
                            <p className="text-sm font-semibold text-white truncate">{summary.latest_movie.title}</p>
                            <p className="text-xs text-white/30">{new Date(summary.latest_movie.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pie Charts */}
            <h2 className="mb-4 text-base font-bold text-white/70 uppercase tracking-wider">Distribution</h2>
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
                <PieChartCard title="Movies by Genre" icon={Film} data={pie_charts.movies_by_genre} colors={GENRE_COLORS} />
                <PieChartCard title="Movies by Source" icon={BarChart3} data={pie_charts.movies_by_source} colors={SOURCE_COLORS} />
                <PieChartCard title="Movies by Status" icon={Activity} data={pie_charts.movies_by_status} colors={STATUS_COLORS} />
                <PieChartCard title="Sync Status" icon={TrendingUp} data={pie_charts.sync_by_status} colors={STATUS_COLORS} />
            </div>

            {/* Column Charts */}
            <h2 className="mb-4 text-base font-bold text-white/70 uppercase tracking-wider">Daily Activity</h2>
            <div className="grid gap-6 lg:grid-cols-2">
                <ColumnChartCard title="Movies Added per Day" icon={Film} data={column_charts.movies_per_day} barColor={COLUMN_COLORS.movies} />
                <ColumnChartCard title="New Users per Day" icon={Users} data={column_charts.users_per_day} barColor={COLUMN_COLORS.users} />
                <ColumnChartCard title="Wishlists per Day" icon={Heart} data={column_charts.wishlists_per_day} barColor={COLUMN_COLORS.wishlists} />
                <ColumnChartCard title="Rating Distribution" icon={Star} data={column_charts.rating_distribution} barColor={COLUMN_COLORS.rating} xKey="range" formatX={(v) => v} />
            </div>
        </div>
    );
}
