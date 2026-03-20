import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Film, Mail, Lock, Loader2, User, Disc, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const { registerWithEmail } = useAuthStore();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validations
    const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password === "" || password.length >= 8;
    const passwordsMatch = password === confirmPassword || confirmPassword === "";

    const isFormValid =
        name.trim() !== "" &&
        email.trim() !== "" &&
        password !== "" &&
        isEmailValid &&
        isPasswordValid &&
        passwordsMatch;

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setErrorMsg("");

        const result = await registerWithEmail({ name, email, password });
        setIsLoading(false);

        if (result.success) {
            navigate("/login");
        } else {
            setErrorMsg(result.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 sm:px-6 lg:px-8">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl">
                {/* Logo & Headline */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                        <Film className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-neutral-400">Join MovieKu to build your wishlist</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5" htmlFor="name">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <User className="h-4 w-4 text-neutral-500" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

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
                                <Lock className={`h-4 w-4 ${isPasswordValid ? "text-neutral-500" : "text-amber-500/70"}`} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`block w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-colors ${isPasswordValid
                                        ? "border-white/10 bg-white/5 focus:border-amber-500 focus:ring-amber-500"
                                        : "border-amber-500/50 bg-amber-500/5 focus:border-amber-500 focus:ring-amber-500"
                                    }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="flex justify-between items-center text-sm font-medium text-neutral-300 mb-1.5" htmlFor="confirm_password">
                            Confirm Password
                            {!passwordsMatch && (
                                <span className="flex items-center gap-1 text-xs text-red-500 font-normal">
                                    <AlertTriangle className="h-3 w-3" />
                                    Passwords do not match
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className={`h-4 w-4 ${passwordsMatch ? "text-neutral-500" : "text-red-500/70"}`} />
                            </div>
                            <input
                                id="confirm_password"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`block w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-colors ${passwordsMatch
                                        ? "border-white/10 bg-white/5 focus:border-amber-500 focus:ring-amber-500"
                                        : "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500"
                                    }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                        Sign Up
                    </button>

                </form>

                <p className="mt-8 text-center text-sm text-neutral-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-amber-500 hover:text-amber-400">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
