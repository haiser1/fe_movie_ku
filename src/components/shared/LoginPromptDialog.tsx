import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginPromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
}

export default function LoginPromptDialog({
    open,
    onOpenChange,
    message = "You need to sign in to access this feature.",
}: LoginPromptDialogProps) {
    const navigate = useNavigate();

    const handleLogin = () => {
        onOpenChange(false);
        navigate("/login");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-white/10 bg-[oklch(0.14_0.02_260)] sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                        <Film className="h-8 w-8 text-amber-500" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-white">
                        Sign In Required
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex flex-col gap-3">
                    <Button
                        onClick={handleLogin}
                        className="w-full gap-2 bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
                    >
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
