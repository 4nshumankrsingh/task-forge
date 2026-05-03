import { useState, useCallback, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { User, LoginPayload, RegisterPayload } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const TOKEN_KEY = "tf_token";
const USER_KEY = "tf_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const [isLoading, setIsLoading] = useState(false);

  const persistAuth = (user: User, token: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    setToken(token);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const handler = () => clearAuth();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [clearAuth]);

const login = useCallback(async (payload: LoginPayload) => {
  console.log("login called with", payload);
  setIsLoading(true);
  try {
    const res = await authService.login(payload);
    console.log("authService.login response", res);
    persistAuth(res.user, res.token);
    toast.success(`Welcome back, ${res.user.name}!`);
  } catch (err) {
    console.error("login threw", err);
    throw err;
  } finally {
    setIsLoading(false);
  }
}, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      persistAuth(res.user, res.token);
      toast.success("Account created! Welcome to Task Forge.");
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    toast.info("Logged out");
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}