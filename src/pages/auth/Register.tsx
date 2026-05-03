import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthField } from "@/components/auth/AuthForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { useMemo } from "react";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(
    () => [
      { label: "8+ characters", pass: password.length >= 8 },
      { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
      { label: "Number", pass: /[0-9]/.test(password) },
    ],
    [password]
  );

  const passCount = checks.filter((c) => c.pass).length;
  if (!password) return null;

  const strength =
    passCount === 3 ? "strong" : passCount === 2 ? "medium" : "weak";
  const strengthColors: Record<string, string> = {
    weak: "bg-destructive",
    medium: "bg-yellow-500",
    strong: "bg-[#57f6e7]",
  };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1 h-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i <= passCount ? strengthColors[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(({ label, pass }) => (
          <span
            key={label}
            className={`flex items-center gap-1 text-xs transition-colors duration-150 ${
              pass ? "text-[#208ca2]" : "text-muted-foreground/60"
            }`}
          >
            <CheckCircle2 size={11} className={pass ? "opacity-100" : "opacity-40"} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

const onSubmit = async (data: RegisterForm) => {
  try {
    const { confirmPassword: _, ...payload } = data;
    await registerUser(payload);
    navigate("/dashboard");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Registration failed");
  }
};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col relative overflow-hidden
                      bg-linear-to-br from-[#0a3d4f] via-[#146886] to-[#1aa5b8]">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/3 -right-25 w-100 h-100 rounded-full
                        bg-[#57f6e7] opacity-10 blur-[100px]" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo — white tinted */}
          <div>
            <img
              src="/logo.png"
              alt="TaskForge"
              className="h-8 w-auto object-contain brightness-0 invert opacity-90"
              draggable={false}
            />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <p className="text-[#57f6e7] text-sm font-medium tracking-wide uppercase mb-3">
              Get started free
            </p>
            <h1 className="text-white text-3xl font-bold leading-snug mb-5">
              Your team's next<br />chapter starts here.
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Set up your workspace in under a minute. No credit card required.
            </p>

            <div className="mt-10 flex flex-col gap-4">
              {[
                { step: "01", text: "Create your account" },
                { step: "02", text: "Set up your first project" },
                { step: "03", text: "Invite your team" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="text-[#57f6e7]/60 font-mono text-xs w-5 shrink-0">{step}</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/70 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} TaskForge. Built for focused teams.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10
                      bg-background relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <img
              src="/logo.png"
              alt="TaskForge"
              className="h-7 w-auto object-contain"
              draggable={false}
            />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Create an account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start building with your team today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <AuthField
              label="Full name"
              id="name"
              type="text"
              placeholder="Jane Smith"
              error={errors.name?.message}
              {...register("name")}
            />
            <AuthField
              label="Work email"
              id="email"
              type="email"
              placeholder="jane@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex flex-col gap-1.5">
              <AuthField
                label="Password"
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrength password={password} />
            </div>
            <AuthField
              label="Confirm password"
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full rounded-lg bg-primary text-white text-sm font-semibold
                         hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2
                         shadow-sm shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}