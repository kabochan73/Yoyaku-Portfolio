"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { AdminCalendar } from "./_components/AdminCalendar";

const ProfileForm = dynamic(() =>
  import("@/components/ProfileForm").then((mod) => mod.ProfileForm)
);

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [profileOpened, setProfileOpened] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") router.replace("/");
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900">管理者ページ</h1>
        <AdminCalendar />

        <div className="mt-6 space-y-3">
          <details
            className="group rounded-2xl border border-zinc-200 bg-white open:pb-6 open:shadow-sm"
            onToggle={(e) => {
              if (e.currentTarget.open) setProfileOpened(true);
            }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-zinc-900">
              プロフィール設定
              <svg
                className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="px-6">{profileOpened && <ProfileForm user={user} />}</div>
          </details>
        </div>
      </div>
    </div>
  );
}
