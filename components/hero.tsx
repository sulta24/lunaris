import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Hero() {
  const buttonNew = (
    <Button asChild className="rounded-full bg-lime-400 px-6 text-black hover:bg-lime-300">
      <a href="https://wa.link/rc25na" target="_blank" rel="noopener noreferrer">
        начать
      </a>
    </Button>
  )

  return (
    <section className="relative isolate overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-14 sm:py-20">
          <h1 className="mt-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">ПРЯМОЙ</span>
            <span className="block text-lime-300 drop-shadow-[0_0_20px_rgba(132,204,22,0.35)]">КОНТАКТ</span>
            <span className="block">С УЧЕННЫМИ</span>
          </h1>
          <div className="mt-6">{buttonNew}</div>

          {/* Phone grid mimic */}
          <div className="mt-10 grid w-full gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {phoneData.map((p, i) => {
              const visibility = i <= 2 ? "block" : i === 3 ? "hidden md:block" : i === 4 ? "hidden xl:block" : "hidden"

              return (
                <div key={i} className={visibility}>
                  <PhoneCard title={p.title} sub={p.sub} tone={p.tone} gradient={p.gradient} imageSrc={p.imageSrc} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function PhoneCard({
  title = "8°",
  sub = "Clear night. Great for render farm runs.",
  tone = "calm",
  gradient = "from-[#0f172a] via-[#14532d] to-[#052e16]",
  imageSrc,
}: {
  title?: string
  sub?: string
  tone?: string
  gradient?: string
  imageSrc?: string
}) {
  return (
    <div className="relative rounded-[28px] glass-border bg-neutral-900 p-2">
      <div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl bg-black">
        <Image
          src={imageSrc ?? "/images/image-removebg-preview.png"}
          alt={`${title} - ${sub}`}
          fill
          className="absolute inset-0 h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
        />

        <div className="relative z-10 p-3">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/20" />
          <div className="space-y-1 px-1">
            <div className="text-3xl font-bold leading-snug text-white/90">{title}</div>
            <p className="text-xs text-white/70">{sub}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const phoneData = [
  {
    title: "Талгат Мусабаев",
    sub: "Казахстанский космонавт",
    tone: "results",
    gradient: "from-[#0b0b0b] via-[#0f172a] to-[#020617]",
    imageSrc: "/images/image-removebg-preview (4).png",
  },
  {
    title: "Юрий Гагарин",
    sub: "Первый человек в космосе",
    tone: "speed",
    gradient: "from-[#0b1a0b] via-[#052e16] to-[#022c22]",
    imageSrc: "/images/image-removebg-preview.png",
  },
  {
    title: "Нил Армстронг",
    sub: "Первый человек на Луне",
    tone: "social",
    gradient: "from-[#001028] via-[#0b355e] to-[#052e5e]",
    imageSrc: "/images/image-removebg-preview (1).png",
  },
  {
    title: "Базз Олдрин",
    sub: "Второй человек на Луне",
    tone: "standout",
    gradient: "from-[#0b0b0b] via-[#1f2937] to-[#0b1220]",
    imageSrc: "/images/image-removebg-preview (2).png",
  },
  {
    title: "Салли Райд",
    sub: "Первая американка в космосе",
    tone: "premium",
    gradient: "from-[#0b0b0b] via-[#111827] to-[#052e16]",
    imageSrc: "/images/image-removebg-preview (3).png",
  },
]
