"use client"

import { useState } from "react"
import { Users, BookMarked, Backpack, Building2, Check } from "lucide-react"

const roles = [
  {
    id: "roditeli",
    label: "Родители",
    icon: Users,
    headline: "Спокойствие вместо тревога",
    text: "Виждате всичко важно за детето си, без да разпитвате всяка вечер.",
    points: [
      "Известие при всяка нова оценка и отсъствие",
      "Директна връзка с класния ръководител",
      "Календар със събития, изпити и родителски срещи",
      "Общ изглед за няколко деца в едно приложение",
    ],
  },
  {
    id: "uchiteli",
    label: "Учители",
    icon: BookMarked,
    headline: "Повече преподаване, по-малко хартия",
    text: "Нанасяте оценки и отсъствия за секунди и си спестявате рутината.",
    points: [
      "Бързо нанасяне от таблет или телефон",
      "Автоматични справки и статистика за класа",
      "Домашни със срокове и напомняния",
      "Съобщения до целия клас с едно докосване",
    ],
  },
  {
    id: "uchenici",
    label: "Ученици",
    icon: Backpack,
    headline: "Всичко за учебния ден на едно място",
    text: "Програма, задачи и оценки — подредени и разбираеми.",
    points: [
      "Седмична програма и промени в реално време",
      "Списък с домашни и наближаващи срокове",
      "Личен напредък по предмети",
      "Материали и файлове от учителите",
    ],
  },
  {
    id: "direktori",
    label: "Директори",
    icon: Building2,
    headline: "Ясна картина за цялото училище",
    text: "Взимайте решения на база данни, а не на предположения.",
    points: [
      "Табла с показатели за успех и посещаемост",
      "Управление на роли и достъп",
      "Отчети към РУО с няколко клика",
      "Централизирана комуникация с родителите",
    ],
  },
]

export function Roles() {
  const [active, setActive] = useState(roles[0].id)
  const current = roles.find((r) => r.id === active) ?? roles[0]
  const Icon = current.icon

  return (
    <section
      id="za-kogo"
      className="border-y border-border bg-gradient-to-b from-secondary/40 to-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue">
            Създадено за цялата общност
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Едно място, четири гледни точки
          </h2>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {roles.map((r) => {
            const RIcon = r.icon
            const on = r.id === active
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  on
                    ? "bg-brand text-brand-foreground shadow-lg shadow-brand/25"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <RIcon className="size-4" />
                {r.label}
              </button>
            )
          })}
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl items-center gap-8 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10 lg:grid-cols-2">
          <div>
            <span className="grid size-14 place-items-center rounded-2xl bg-brand/12 text-brand">
              <Icon className="size-7" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-bold text-foreground">
              {current.headline}
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {current.text}
            </p>
          </div>

          <ul className="grid gap-3">
            {current.points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <Check className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
