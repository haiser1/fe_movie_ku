import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Film, Mail, Lock, Loader2, Disc, AlertTriangle } from "lucide-react";

export default function LoginPage() {
    const { loginWithEmail } = useAuthStore();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Validations
    const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password === "" || password.length >= 8;
    const isFormValid = email.trim() !== "" && password !== "" && isEmailValid && isPasswordValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsLoading(true);
        setErrorMsg("");

        const result = await loginWithEmail({ email, password });
        setIsLoading(false);

        if (result.success) {
            navigate("/");
        } else {
            setErrorMsg(result.message);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/login`;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 sm:px-6 lg:px-8">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl">
                {/* Logo & Headline */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                        <Film className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-neutral-400">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMsg && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="flex justify-between items-center text-sm font-medium text-neutral-300 mb-1.5" htmlFor="email">
                            Email address
                            {!isEmailValid && (
                                <span className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                                    <AlertTriangle className="h-3 w-3" />
                                    Invalid email format
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className={`h-4 w-4 ${isEmailValid ? "text-neutral-500" : "text-amber-500/70"}`} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-colors ${isEmailValid
                                    ? "border-white/10 bg-white/5 focus:border-amber-500 focus:ring-amber-500"
                                    : "border-amber-500/50 bg-amber-500/5 focus:border-amber-500 focus:ring-amber-500"
                                    }`}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex justify-between items-center text-sm font-medium text-neutral-300 mb-1.5" htmlFor="password">
                            Password
                            {!isPasswordValid && (
                                <span className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                                    <AlertTriangle className="h-3 w-3" />
                                    Min 8 characters
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-4 w-4 text-neutral-500" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        className="group relative flex w-full justify-center rounded-xl bg-amber-500 px-4 py-2.5 pl-8 text-sm font-semibold text-neutral-950 transition-all hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-70 disabled:hover:bg-amber-500"
                    >
                        {isLoading ? (
                            <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin" />
                        ) : (
                            <Disc className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform group-hover:rotate-180" />
                        )}
                        Sign In
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="shrink-0 px-4 text-xs text-neutral-500 uppercase tracking-widest">or continue with</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>

                </form>

                <p className="mt-8 text-center text-sm text-neutral-400">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="font-semibold text-amber-500 hover:text-amber-400">
                        Sign up now
                    </Link>
                </p>
            </div>
        </div>
    );
}
