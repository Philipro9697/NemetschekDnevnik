import {
  GraduationCap,
  CalendarDays,
  MessageSquareText,
  ClipboardList,
  BellRing,
  ShieldCheck,
} from "lucide-react"

const features = [
  {
    icon: GraduationCap,
    title: "Оценки в реално време",
    text: "Всяка оценка достига до родителя веднага, с коментар и контекст, а не в края на срока.",
    tone: "brand",
  },
  {
    icon: CalendarDays,
    title: "Програма и отсъствия",
    text: "Седмичното разписание, закъсненията и извиненията са синхронизирани и винаги под ръка.",
    tone: "blue",
  },
  {
    icon: ClipboardList,
    title: "Домашни и проекти",
    text: "Задания със срокове, прикачени файлове и напомняния, за да не се пропусне нищо.",
    tone: "brand",
  },
  {
    icon: MessageSquareText,
    title: "Съобщения без групи в чата",
    text: "Учителите и родителите общуват директно и спокойно, в защитена среда.",
    tone: "blue",
  },
  {
    icon: BellRing,
    title: "Известия, които значат",
    text: "Умни известия за нова оценка, отсъствие или спешно съобщение — без излишен шум.",
    tone: "brand",
  },
  {
    icon: ShieldCheck,
    title: "Сигурност по подразбиране",
    text: "Данните на децата са защитени по GDPR, с роли и достъп според позицията.",
    tone: "blue",
  },
]

export function Features() {
  return (
    <section id="funkcii" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-brand">
          Всичко необходимо
        </span>
        <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Един дневник вместо десет разговора
        </h2>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Спрете да събирате информация от бележки, чатове и телефонни обаждания.
          Aula подрежда учебния живот на място.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon
          const isBrand = f.tone === "brand"
          return (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10"
            >
              <span
                className={`grid size-12 place-items-center rounded-xl ${
                  isBrand
                    ? "bg-brand/12 text-brand"
                    : "bg-blue/12 text-blue"
                }`}
              >
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {f.text}
              </p>
              <span
                className={`pointer-events-none absolute -right-10 -top-10 size-24 rounded-full blur-2xl transition-opacity ${
                  isBrand ? "bg-brand/20" : "bg-blue/20"
                } opacity-0 group-hover:opacity-100`}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
