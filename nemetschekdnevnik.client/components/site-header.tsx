"use client"

import { useState } from "react"
import { GraduationCap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const nav = [
  { label: "Функции", href: "#funkcii" },
  { label: "За кого", href: "#za-kogo" },
  { label: "Дневник", href: "#dnevnik" },
  { label: "Отзиви", href: "#otzivi" },
  { label: "Цени", href: "#ceni" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" className="rounded-full font-semibold">
            Вход
          </Button>
          <Button className="rounded-full bg-brand font-semibold text-brand-foreground shadow-lg shadow-brand/25 hover:bg-brand/90">
            <GraduationCap className="size-4" />
            Заявете демо
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          aria-label="Меню"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" className="rounded-full font-semibold">
                Вход
              </Button>
              <Button className="rounded-full bg-brand font-semibold text-brand-foreground hover:bg-brand/90">
                Заявете демо
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
