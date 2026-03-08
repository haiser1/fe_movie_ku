import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Film, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            const errorParam = searchParams.get("error");
            if (errorParam) {
                setError(errorParam);
                setTimeout(() => navigate("/"), 3000);
                return;
            }

            const user = await handleOAuthCallback(searchParams);
            if (user) {
                // Role-based redirect
                if (user.role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } else {
                setError("Authentication failed. Please try again.");
                setTimeout(() => navigate("/"), 3000);
            }
        };

        processCallback();
    }, []);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Film className="h-8 w-8 text-amber-500" />
            </div>

            {error ? (
                <div className="text-center">
                    <p className="text-lg font-semibold text-red-400">
                        Authentication Error
                    </p>
                    <p className="mt-2 text-sm text-white/50">{error}</p>
                    <p className="mt-4 text-xs text-white/30">
                        Redirecting to home...
                    </p>
                </div>
            ) : (
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
                    <p className="mt-4 text-sm text-white/60">
                        Signing you in...
                    </p>
                </div>
            )}
        </div>
    );
}
