import api from "@/lib/axios";
import type { LoginPayload, RegisterPayload, AuthResponse, User } from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async updateProfile(payload: Partial<Pick<User, "name">>): Promise<User> {
    const { data } = await api.patch<User>("/auth/profile", payload);
    return data;
  },
};