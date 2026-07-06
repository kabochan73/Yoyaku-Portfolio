import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  reservations_count: number;
};

export function useAdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasSearched = debouncedSearch.trim().length > 0;

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: async () => {
      const { data } = await api.get<AdminUser[]>(
        `/admin/users?search=${encodeURIComponent(debouncedSearch)}`,
      );
      return data;
    },
    enabled: hasSearched,
  });

  return { search, setSearch, users, isLoading, hasSearched };
}
