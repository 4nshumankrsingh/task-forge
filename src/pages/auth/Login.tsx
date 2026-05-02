import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthField } from "@/components/auth/AuthForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col relative overflow-hidden
                      bg-linear-to-br from-[#0f4f63] via-[#146886] to-[#0d7a8a]">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-20 -right-20 w-90 h-90 rounded-full
                        bg-[#57f6e7] opacity-10 blur-[80px]" />
        <div className="absolute -bottom-15 -left-15 w-70 h-70 rounded-full
                        bg-[#208ca2] opacity-15 blur-[60px]" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo — white tinted via CSS filter */}
          <div>
            <img
              src="/logo.png"
              alt="TaskForge"
              className="h-8 w-auto object-contain brightness-0 invert opacity-90"
              draggable={false}
            />
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <p className="text-[#57f6e7] text-sm font-medium tracking-wide uppercase mb-3">
              Collaborative Work, Simplified
            </p>
            <h1 className="text-white text-3xl font-bold leading-snug mb-5">
              Build things that<br />matter, together.
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Organize projects, assign tasks, track progress — all in one workspace your entire team actually wants to use.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {[
                "Real-time project dashboards",
                "Role-based access for every team",
                "Task tracking with deadlines & priorities",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#57f6e7] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
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
          {/* Mobile logo — shown only when left panel is hidden */}
          <div className="flex items-center mb-8 lg:hidden">
            <img
              src="/logo.png"
              alt="TaskForge"
              className="h-7 w-auto object-contain"
              draggable={false}
            />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <AuthField
              label="Email address"
              id="email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <AuthField
              label="Password"
              id="password"
              type="password"
              placeholder="Your password"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between text-sm mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
                <input
                  type="checkbox"
                  className="rounded border-border accent-primary h-3.5 w-3.5"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 w-full rounded-lg bg-primary text-white text-sm font-semibold
                         hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2
                         shadow-sm shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await login({ email: "demo@taskforge.dev", password: "demo1234" });
                navigate("/dashboard");
              } catch {
                toast.info("Demo account not yet available. Backend coming in Phase 3.");
              }
            }}
            className="w-full h-10 rounded-lg border border-border text-sm font-medium
                       text-foreground hover:bg-accent transition-colors duration-150"
          >
            Continue with demo account
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}