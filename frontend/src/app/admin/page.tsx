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
const RegularHolidayPanel = dynamic(() =>
  import("./_components/RegularHolidayPanel").then((mod) => mod.RegularHolidayPanel)
);
const HolidayPanel = dynamic(() =>
  import("./_components/HolidayPanel").then((mod) => mod.HolidayPanel)
);
const UserSearchPanel = dynamic(() =>
  import("./_components/UserSearchPanel").then((mod) => mod.UserSearchPanel)
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
      <div className="px-4 py-10">
        <AdminCalendar />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-10">
        <div className="space-y-3">
          <AccordionItem title="料金設定">
            <PricePanel />
          </AccordionItem>
          <AccordionItem title="定休日設定">
            <RegularHolidayPanel />
          </AccordionItem>
          <AccordionItem title="臨時休業日設定">
            <HolidayPanel />
          </AccordionItem>
          <AccordionItem title="ユーザー検索">
            <UserSearchPanel />
          </AccordionItem>
          <AccordionItem title="プロフィール設定">
            <ProfileForm user={user} />
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}
