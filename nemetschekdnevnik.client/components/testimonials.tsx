import Image from "next/image"
import { Star } from "lucide-react"

const items = [
  {
    quote:
      "Най-накрая виждам оценките на дъщеря ми в момента, в който ги получи. Вечерите ни са по-спокойни, а разговорите — по-смислени.",
    name: "Иван Георгиев",
    role: "родител, 8 клас",
    avatar: "/avatar-parent.png",
  },
  {
    quote:
      "Нанасям оценки от таблета между часовете. Спестявам поне два часа седмично, които връщам на учениците.",
    name: "Даниела Стоянова",
    role: "учител по математика",
    avatar: "/avatar-teacher.png",
  },
  {
    quote:
      "Виждам програмата и домашните си навсякъде. Вече не забравям срокове и си планирам седмицата сама.",
    name: "Виктория Илиева",
    role: "ученичка, 10 клас",
    avatar: "/avatar-student.png",
  },
]

export function Testimonials() {
  return (
    <section id="otzivi" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-brand">
          Обичано от общността
        </span>
        <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Хора, които вече дишат по-леко
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-brand text-brand" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-foreground">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <Image
                src={t.avatar}
                alt={t.name}
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
