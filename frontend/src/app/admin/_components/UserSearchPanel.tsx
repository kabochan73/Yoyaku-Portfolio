"use client";

import { useAdminUsers } from "../_hooks/useAdminUsers";

export function UserSearchPanel() {
  const { search, setSearch, users, isLoading, hasSearched } = useAdminUsers();

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="名前またはメールアドレスで検索"
        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600" />
        </div>
      )}
      {!isLoading && hasSearched && users?.length === 0 && (
        <p className="text-sm text-zinc-400">ユーザーが見つかりませんでした</p>
      )}
      {users && users.length > 0 && (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="rounded-lg bg-zinc-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{u.name}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  予約 {u.reservations_count}件
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
