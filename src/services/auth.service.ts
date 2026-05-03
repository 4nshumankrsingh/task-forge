import api from "@/lib/axios";
import type { LoginPayload, RegisterPayload, AuthResponse, User } from "@/types/auth";

interface BackendResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<BackendResponse>("/auth/login", payload);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<BackendResponse>("/auth/register", payload);
    return data.data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ success: boolean; data: User }>("/auth/me");
    return data.data;
  },

  async updateProfile(payload: Partial<Pick<User, "name">>): Promise<User> {
    const { data } = await api.patch<{ success: boolean; data: User }>("/auth/profile", payload);
    return data.data;
  },
};