"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export function Header() {
  const { user, isLoading, logout } = useUser();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-green-600 transition-transform hover:scale-105"
        >
          <span className="text-lg font-bold tracking-wide sm:text-2xl">FUTSAL PARK</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {isLoading ? null : !user ? (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 sm:px-4 sm:text-sm"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 sm:px-4 sm:text-sm"
              >
                新規登録
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-lg border border-zinc-400 px-2.5 py-1.5 text-xs font-bold bg-green-600 text-white transition hover:bg-green-700 sm:px-4 sm:text-sm"
                >
                  管理者ページ
                </Link>
              ) : (
                <Link
                  href="/mypage"
                  className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-green-700 sm:px-4 sm:text-sm"
                >
                  My Page
                </Link>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-zinc-400 px-2.5 py-1.5 text-xs font-bold text-zinc-700 transition hover:border-zinc-400 sm:px-4 sm:text-sm"
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
