import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    BarChart3,
    Film,
    Users,
    RefreshCw,
    LogOut,
    Menu,
    X,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAdminSyncStore, getActiveSyncLogId } from "@/stores/adminSyncStore";

const navItems = [
    {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: BarChart3,
    },
    {
        label: "Movie Management",
        path: "/admin/movies",
        icon: Film,
    },
    {
        label: "User Management",
        path: "/admin/users",
        icon: Users,
    },
    {
        label: "TMDB Sync",
        path: "/admin/sync",
        icon: RefreshCw,
    },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const isSyncing = useAdminSyncStore((s) => s.isSyncing);

    const handleLogout = async () => {
        // If a sync is running, stop it first
        if (isSyncing || getActiveSyncLogId()) {
            const state = useAdminSyncStore.getState();
            state.stopSync();
            const syncLogId = state.batchProgress?.sync_log_id || getActiveSyncLogId();
            if (syncLogId) {
                await state.stopSyncApi(syncLogId);
            }
            localStorage.removeItem("active_sync_session");
        }
        await logout();
        setLogoutConfirm(false);
        navigate("/");
    };

    const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
        <div
            className={`flex h-full flex-col bg-[oklch(0.11_0.02_260)] ${mobile ? "w-72" : "w-64"
                }`}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                    <Film className="h-4 w-4 text-black" />
                </div>
                <div>
                    <span className="text-base font-bold text-white">
                        Movie<span className="text-amber-500">Ku</span>
                    </span>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500/70">
                        Admin Panel
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                ? "bg-amber-500/15 text-amber-400"
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-amber-400" : ""
                                        }`}
                                />
                                <span>{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-amber-400/60" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-white/5 p-4">
                {user && (
                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                        {user.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt={user.name}
                                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-white/40">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setLogoutConfirm(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden flex-shrink-0 border-r border-white/5 lg:flex">
                <Sidebar />
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 flex-shrink-0 lg:hidden">
                        <Sidebar mobile />
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Top Bar */}
                <header className="flex h-14 items-center gap-4 border-b border-white/5 bg-[oklch(0.11_0.02_260)] px-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-white/60 hover:text-white"
                    >
                        {sidebarOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                    <span className="text-sm font-semibold text-white">
                        Movie<span className="text-amber-500">Ku</span>{" "}
                        <span className="text-white/40">Admin</span>
                    </span>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation */}
            {logoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-4">
                            <LogOut className="h-5 w-5 text-red-400" />
                        </div>
                        <h2 className="text-center text-base font-semibold text-white">Sign Out?</h2>
                        <p className="mt-2 text-center text-sm text-white/50">
                            Are you sure you want to sign out of your account?
                        </p>
                        {(isSyncing || getActiveSyncLogId()) && (
                            <div className="mt-4 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 flex items-start gap-2.5">
                                <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-400">
                                    A TMDB sync is currently in progress. Signing out will stop the sync process.
                                </p>
                            </div>
                        )}
                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => setLogoutConfirm(false)}
                                className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
                            >
                                {(isSyncing || getActiveSyncLogId()) ? "Stop Sync & Sign Out" : "Sign Out"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
