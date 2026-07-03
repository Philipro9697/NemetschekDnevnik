import Image from "next/image"
import { BookOpen, TrendingUp, Check } from "lucide-react"

const grades = [
  { subject: "Математика", grade: "6.00", tone: "bg-brand text-brand-foreground" },
  { subject: "Български език", grade: "5.50", tone: "bg-blue text-blue-foreground" },
  { subject: "История", grade: "5.00", tone: "bg-chart-3 text-brand-foreground" },
  { subject: "Биология", grade: "6.00", tone: "bg-brand text-brand-foreground" },
]

export function HeroBoard() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* main card */}
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-brand/10">
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-brand/10 to-blue/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <BookOpen className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Дневник · 8В клас</p>
              <p className="text-xs text-muted-foreground">Мария Петрова</p>
            </div>
          </div>
          <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
            Успех 5.62
          </span>
        </div>

        <div className="relative aspect-[16/10] w-full">
          <Image
            src="/hero-students.png"
            alt="Родител и ученик преглеждат дневника заедно"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 p-4">
          {grades.map((g) => (
            <div
              key={g.subject}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <span className="truncate text-sm font-medium text-foreground">
                {g.subject}
              </span>
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${g.tone}`}
              >
                {g.grade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* floating attendance card */}
      <div
        className="absolute -left-5 top-40 hidden animate-float rounded-2xl border border-border bg-card p-4 shadow-xl sm:block"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-brand/15 text-brand">
            <Check className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Присъствие</p>
            <p className="text-lg font-bold text-foreground">98,4%</p>
          </div>
        </div>
      </div>

      {/* floating trend card */}
      <div
        className="absolute -right-3 -top-5 hidden animate-float rounded-2xl border border-border bg-card p-4 shadow-xl sm:block"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-blue/15 text-blue">
            <TrendingUp className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Спрямо срока</p>
            <p className="text-lg font-bold text-brand">+0,42</p>
          </div>
        </div>
      </div>
    </div>
  )
}
