import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="relative">
            <input
              type={isPassword ? (showPassword ? "text" : "password") : type}
              className={cn(
                "flex h-12 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rikka-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                error && "border-red-500 focus-visible:ring-red-500",
                isPassword && "pr-10", // Add padding for the icon
                className
              )}
              ref={ref}
              {...props}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            )}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
