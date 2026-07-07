import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-zinc-900">404</h1>
      <p className="text-zinc-500">お探しのページは見つかりませんでした。</p>
      <Link
        href="/"
        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
