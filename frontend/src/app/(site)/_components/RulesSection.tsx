export function RulesSection() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900">
          利用規約
        </h2>
        <div className="rounded-xl border border-zinc-200 p-6">
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>・ご予約のキャンセルは、利用時間の24時間前までにお願いいたします。</li>
            <li>
              ・キャンセル料は、利用時間の24時間以内のキャンセルは利用料金の100%を頂戴いたします。
            </li>
            <li>・コート内での飲食(フタ付きの飲料は可)、喫煙は禁止です。</li>
            <li>・施設・備品を破損・紛失された場合は、実費をご請求させていただきます。</li>
            <li>・その他、スタッフの指示に従ってご利用ください。</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
