import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Старт",
    price: "0",
    tagline: "За малки паралелки, които тепърва започват",
    features: [
      "До 60 ученици",
      "Оценки и отсъствия",
      "Седмична програма",
      "Мобилно приложение",
    ],
    cta: "Започнете безплатно",
    highlight: false,
  },
  {
    name: "Училище",
    price: "2,90",
    tagline: "Пълният набор за цялото училище",
    features: [
      "Неограничени ученици",
      "Съобщения и известия",
      "Домашни и материали",
      "Справки и статистика",
      "Отчети към РУО",
    ],
    cta: "Заявете демо",
    highlight: true,
  },
  {
    name: "Община",
    price: "По заявка",
    tagline: "За общини и образователни мрежи",
    features: [
      "Всичко от „Училище“",
      "Централно управление",
      "SSO и интеграции",
      "Персонален мениджър",
    ],
    cta: "Свържете се с нас",
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="ceni" className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue">
            Прозрачни цени
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            План за всяко училище
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Цени на ученик за учебна година. Без скрити такси, без обвързване.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                p.highlight
                  ? "border-brand bg-card shadow-2xl shadow-brand/15 lg:-mt-4 lg:mb-4"
                  : "border-border bg-card"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground shadow-md">
                  Най-избиран
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-foreground">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">
                  {p.price === "По заявка" ? p.price : `${p.price} лв`}
                </span>
                {p.price !== "По заявка" && (
                  <span className="mb-1 text-sm text-muted-foreground">
                    / ученик
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-7 h-11 w-full rounded-full font-semibold ${
                  p.highlight
                    ? "bg-brand text-brand-foreground shadow-lg shadow-brand/25 hover:bg-brand/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
