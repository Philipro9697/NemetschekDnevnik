"use client"

import { useState } from "react"
import { Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react"

type Lesson = {
  time: string
  subject: string
  room: string
  grade?: string
  status?: "done" | "absent"
}

const week: Record<string, Lesson[]> = {
  Пон: [
    { time: "08:00", subject: "Математика", room: "214", grade: "6.00", status: "done" },
    { time: "08:50", subject: "Български език", room: "108", status: "done" },
    { time: "09:55", subject: "Английски език", room: "301" },
    { time: "10:45", subject: "Физическо", room: "Салон" },
  ],
  Вто: [
    { time: "08:00", subject: "История", room: "112", grade: "5.00", status: "done" },
    { time: "08:50", subject: "Биология", room: "220", grade: "6.00", status: "done" },
    { time: "09:55", subject: "Химия", room: "218", status: "absent" },
    { time: "10:45", subject: "Музика", room: "104" },
  ],
  Сря: [
    { time: "08:00", subject: "География", room: "109", status: "done" },
    { time: "08:50", subject: "Математика", room: "214", grade: "5.50", status: "done" },
    { time: "09:55", subject: "Информатика", room: "402" },
    { time: "10:45", subject: "Литература", room: "108" },
  ],
  Чет: [
    { time: "08:00", subject: "Физика", room: "216", grade: "5.00", status: "done" },
    { time: "08:50", subject: "Български език", room: "108" },
    { time: "09:55", subject: "Английски език", room: "301", grade: "6.00", status: "done" },
    { time: "10:45", subject: "Изобразително", room: "106" },
  ],
  Пет: [
    { time: "08:00", subject: "Биология", room: "220" },
    { time: "08:50", subject: "История", room: "112", grade: "5.50", status: "done" },
    { time: "09:55", subject: "Математика", room: "214" },
    { time: "10:45", subject: "Класен час", room: "108" },
  ],
}

const days = Object.keys(week)

function gradeTone(grade: string) {
  const n = Number.parseFloat(grade)
  if (n >= 5.5) return "bg-brand text-brand-foreground"
  if (n >= 4.5) return "bg-blue text-blue-foreground"
  return "bg-chart-4 text-brand-foreground"
}

export function DiaryPreview() {
  const [day, setDay] = useState(days[0])
  const lessons = week[day]

  return (
    <section id="dnevnik" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-brand">
            Живият дневник
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Прегледайте седмицата за секунди
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Разписание, оценки и отсъствия в един изчистен изглед. Изберете ден и
            вижте точно какво се случва в класната стая — така, както го виждат
            хиляди семейства всеки ден.
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4">
            {[
              { k: "Оценки", v: "5.62" },
              { k: "Отсъствия", v: "1" },
              { k: "Домашни", v: "3" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-2xl border border-border bg-card p-4 text-center"
              >
                <dd className="font-display text-2xl font-extrabold text-foreground">
                  {s.v}
                </dd>
                <dt className="mt-1 text-xs text-muted-foreground">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-brand/10">
          <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 p-2">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all ${
                  d === day
                    ? "bg-brand text-brand-foreground shadow-md shadow-brand/25"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <ul className="divide-y divide-border">
            {lessons.map((l, i) => (
              <li
                key={`${day}-${i}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/30 sm:px-5"
              >
                <div className="flex w-14 shrink-0 items-center gap-1 text-sm font-semibold text-muted-foreground">
                  <Clock className="size-3.5" />
                  {l.time}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {l.subject}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    Каб. {l.room}
                  </p>
                </div>
                {l.grade ? (
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${gradeTone(
                      l.grade,
                    )}`}
                  >
                    {l.grade}
                  </span>
                ) : l.status === "absent" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                    <AlertCircle className="size-3.5" />
                    Отсъствие
                  </span>
                ) : l.status === "done" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-brand" />
                ) : (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    Предстои
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
