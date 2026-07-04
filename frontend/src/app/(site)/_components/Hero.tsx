import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-96 w-full overflow-hidden">
      <Image
        src="/court.png"
        alt="屋内フットサルコート"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-center px-4">
        <div className="max-w-md">
          <p className="text-sm font-semibold text-green-600">
            屋内人工芝フットサルコート
          </p>
          <h1 className="mt-2 text-4xl font-bold text-zinc-900">
            FUTSAL PARK
          </h1>
          <p className="mt-4 text-zinc-600">
            快適な屋内コートで、思いっきりフットサルを楽しもう!
          </p>

          <div className="mt-6 flex flex-col gap-2 text-sm text-zinc-700">
            <p>092-123-4567　受付時間 10:00〜22:00</p>
            <p>〒000-0000 福岡県福岡市中央区1-2-3</p>
          </div>
        </div>
      </div>
    </section>
  );
}
