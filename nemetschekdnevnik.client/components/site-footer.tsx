import { Logo } from "@/components/logo"

const cols = [
  {
    title: "Продукт",
    links: ["Функции", "Дневник", "Мобилно приложение", "Сигурност", "Цени"],
  },
  {
    title: "Училища",
    links: ["Внедряване", "Обучения", "Отчети към РУО", "Помощен център", "Статус"],
  },
  {
    title: "Компания",
    links: ["За нас", "Кариери", "Блог", "Контакти", "Партньори"],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Електронният дневник, който свързва учители, родители и ученици в
              спокойна и сигурна среда.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aula. Всички права запазени.
          </p>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <a href="#" className="hover:text-brand">
              Поверителност
            </a>
            <a href="#" className="hover:text-brand">
              Условия
            </a>
            <a href="#" className="hover:text-brand">
              GDPR
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
