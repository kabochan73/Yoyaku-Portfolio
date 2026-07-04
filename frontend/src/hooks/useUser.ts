import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
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
    staleTime: 5 * 60 * 1000,
  });

  const logout = useMutation({
    mutationFn: () => api.post("/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    logout: logout.mutate,
    isLoggingOut: logout.isPending,
  };
}
