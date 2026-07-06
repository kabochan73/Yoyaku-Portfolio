"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { AccordionItem } from "@/components/AccordionItem";
import { AdminCalendar } from "./_components/AdminCalendar";

const ProfileForm = dynamic(() =>
  import("@/components/ProfileForm").then((mod) => mod.ProfileForm)
);
const PricePanel = dynamic(() =>
  import("./_components/PricePanel").then((mod) => mod.PricePanel)
);

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

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
          <AccordionItem title="料金設定">
            <PricePanel />
          </AccordionItem>
          <AccordionItem title="プロフィール設定">
            <ProfileForm user={user} />
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}
