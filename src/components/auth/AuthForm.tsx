import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, type = "text", ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={rest.id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            aria-invalid={!!error}
            aria-describedby={error ? `${rest.id}-error` : undefined}
            className={cn(
              "w-full h-10 px-3 rounded-lg border text-sm bg-background",
              "placeholder:text-muted-foreground/60",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
              error
                ? "border-destructive/70 focus:ring-destructive/30"
                : "border-border hover:border-border/80",
              isPassword && "pr-10"
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-muted-foreground hover:text-foreground
                         transition-colors duration-150"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${rest.id}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle size={12} />
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthField.displayName = "AuthField";