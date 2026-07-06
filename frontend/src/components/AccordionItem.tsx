"use client";

import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function AccordionItem({ title, children }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <details
      className="group rounded-2xl border border-zinc-200 bg-white open:pb-6 open:shadow-sm"
      onToggle={(e) => {
        if (e.currentTarget.open) setOpened(true);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-zinc-900">
        {title}
        <svg
          className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6">{opened && children}</div>
    </details>
  );
}
