import Link from "next/link";

const items = [
  { title: "브랜디드 01", thumb: "/thumbs/br_01.jpg" },
  { title: "브랜디드 02", thumb: "/thumbs/br_02.jpg" },
  { title: "브랜디드 03", thumb: "/thumbs/br_03.jpg" },
  { title: "브랜디드 04", thumb: "/thumbs/br_04.jpg" },
];

export default function BrandedPage() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url(/images/screen_bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-[0.22em] text-white/70">CATEGORY</div>
            <h1 className="text-2xl mt-1">브랜디드</h1>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md hover:bg-white hover:text-black transition"
          >
            BACK
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it) => (
            <button
              key={it.title}
              className="group rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md overflow-hidden hover:bg-black/35 transition"
            >
              <div className="aspect-[4/3] bg-black/40">
                <img
                  src={it.thumb}
                  alt={it.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                />
              </div>
              <div className="p-3 text-sm text-left">{it.title}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
