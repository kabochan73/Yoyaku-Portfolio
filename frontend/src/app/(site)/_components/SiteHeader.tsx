"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export function SiteHeader() {
  const { user, isLoading, logout } = useUser();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-green-600">
          <span className="text-2xl font-bold tracking-wide">FUTSAL PARK</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isLoading ? null : !user ? (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                新規登録
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/mypage"
                className="text-sm text-zinc-600 transition hover:text-zinc-900"
              >
                マイページ
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400"
              >
                ログアウト
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
