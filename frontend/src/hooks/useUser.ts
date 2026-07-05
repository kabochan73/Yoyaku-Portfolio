import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/axios";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};
export type ProfileInput = {
  name: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
};

async function fetchUser(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/user");
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export function useUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: Infinity,
  });

  const logout = useMutation({
    mutationFn: () => api.post("/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  const login = useMutation({
    mutationFn: async (input: LoginInput) => {
      await getCsrfCookie();
      const { data } = await api.post<User>("/login", input);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const register = useMutation({
    mutationFn: async (input: RegisterInput) => {
      await getCsrfCookie();
      const { data } = await api.post<User>("/register", input);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (input: ProfileInput) => {
      const { data } = await api.put<User>("/profile", input);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    logout: logout.mutate,
    isLoggingOut: logout.isPending,
    login: login.mutateAsync,
    isLoggingIn: login.isPending,
    loginError: login.error,
    register: register.mutateAsync,
    isRegistering: register.isPending,
    registerError: register.error,
    updateProfile: updateProfile.mutateAsync,
    isUpdatingProfile: updateProfile.isPending,
  };
}
