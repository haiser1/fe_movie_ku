import { Link, useLocation } from "react-router-dom";
import { Film, Search, Menu, X, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import LoginPromptDialog from "@/components/shared/LoginPromptDialog";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loginPrompt, setLoginPrompt] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    const navLinks = [
        { label: "Home", path: "/" },
        { label: "Movies", path: "/movies" },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleSearch = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setMobileOpen(false);
        }
    };

    const handleWishlistClick = () => {
        if (isAuthenticated) {
            navigate("/wishlist");
        } else {
            setLoginPrompt(true);
        }
        setMobileOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        setUserMenuOpen(false);
        setLogoutConfirm(false);
        setMobileOpen(false);
        navigate("/");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 transition group-hover:bg-amber-400">
                            <Film className="h-5 w-5 text-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Movie<span className="text-amber-500">Ku</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive(link.path)
                                    ? "bg-white/10 text-white"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/* Wishlist Nav */}
                        <button
                            onClick={handleWishlistClick}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive("/wishlist")
                                ? "bg-white/10 text-white"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Heart className="h-3.5 w-3.5" />
                            Wishlist
                        </button>
                    </div>

                    {/* Desktop Search + Auth */}
                    <div className="hidden items-center gap-3 md:flex">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-56 rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-amber-500/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-500/25"
                            />
                        </form>

                        {isAuthenticated && user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10"
                                >
                                    {user.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user.name}
                                            className="h-6 w-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm text-white/80 max-w-[100px] truncate">
                                        {user.name}
                                    </span>
                                </button>

                                {/* Dropdown */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.14_0.02_260)] shadow-xl">
                                            <div className="border-b border-white/5 px-4 py-3">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-white/40 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="py-1">
                                                {user.role === "admin" && (
                                                    <Link
                                                        to="/admin/dashboard"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                                                    >
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/my-movies"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                                                >
                                                    <Film className="h-4 w-4" />
                                                    My Movies
                                                </Link>
                                                <Link
                                                    to="/wishlist"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    Wishlist
                                                </Link>
                                                <button
                                                    onClick={() => { setUserMenuOpen(false); setLogoutConfirm(true); }}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/5 hover:text-red-300"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                                onClick={handleLogin}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="text-white/70 hover:text-white md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="border-t border-white/10 bg-background px-4 py-4 md:hidden">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(link.path)
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleWishlistClick}
                                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-left flex items-center gap-2 ${isActive("/wishlist")
                                    ? "bg-white/10 text-white"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Heart className="h-4 w-4" />
                                Wishlist
                            </button>

                            {isAuthenticated && user && (
                                <>
                                    <Link
                                        to="/my-movies"
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <Film className="h-4 w-4" />
                                        My Movies
                                    </Link>
                                    {user.role === "admin" && (
                                        <Link
                                            to="/admin/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    )}
                                </>
                            )}

                            <form onSubmit={handleSearch} className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                                />
                            </form>

                            <div className="mt-2 border-t border-white/5 pt-3">
                                {isAuthenticated && user ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 px-4 py-2">
                                            {user.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt={user.name}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-white/40">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setLogoutConfirm(true)}
                                            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/5"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full bg-amber-500 text-black font-semibold hover:bg-amber-400"
                                        onClick={handleLogin}
                                    >
                                        Sign In
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Login Prompt Dialog */}
            <LoginPromptDialog
                open={loginPrompt}
                onOpenChange={setLoginPrompt}
                message="Sign in to access your wishlist and save your favorite movies."
            />

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
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
