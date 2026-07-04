export function Footer() {
  return (
    <footer className="bg-zinc-900 py-8 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-10 px-4">
        <div className="flex flex-wrap gap-10">
          <div className="flex items-start gap-2">
            <div>
              <p className="font-bold">092-123-4567</p>
              <p className="text-xs text-zinc-400">受付時間 10:00〜22:00</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div>
              <p className="text-sm">〒000-0000</p>
              <p className="text-sm">福岡県福岡市中央区1-2-3</p>
            </div>
          </div>
        </div>

        <p className="text-2xl font-bold tracking-wide text-white">
          FUTSAL PARK
        </p>
      </div>
    </footer>
  );
}
