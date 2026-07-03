import { ArrowRight, CalendarCheck, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBoard } from "@/components/hero-board"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft color glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-70" />
      <div className="pointer-events-none absolute -left-32 -top-24 -z-10 size-96 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 -z-10 size-96 rounded-full bg-blue/20 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-sm font-semibold text-brand">
            <Sparkles className="size-4" />
            Ново: AI обобщения на успеха
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Училището на едно място,{" "}
            <span className="text-gradient">разбираемо за всички</span>
          </h1>

          <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Aula свързва учители, родители и ученици — оценки, отсъствия,
            седмична програма, домашни и съобщения текат в реално време, без
            хаос и без хартия.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-full bg-brand px-7 text-base font-semibold text-brand-foreground shadow-xl shadow-brand/25 hover:bg-brand/90"
            >
              Започнете безплатно
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-2 px-7 text-base font-semibold"
            >
              <CalendarCheck className="size-4" />
              Гледайте демо
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["bg-brand", "bg-blue", "bg-chart-3", "bg-chart-4"].map((c) => (
                  <span
                    key={c}
                    className={`size-7 rounded-full border-2 border-background ${c}`}
                  />
                ))}
              </div>
              <span>
                <strong className="font-semibold text-foreground">
                  1 400+ училища
                </strong>{" "}
                вече ползват Aula
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-brand text-brand" />
              ))}
              <span className="ml-1 font-medium text-foreground">4.9 / 5</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <HeroBoard />
        </div>
      </div>
    </section>
  )
}
