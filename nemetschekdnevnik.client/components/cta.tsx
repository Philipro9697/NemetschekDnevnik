import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-blue px-6 py-14 text-center shadow-2xl shadow-brand/20 sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-white/10 blur-2xl" />

        <h2 className="relative mx-auto max-w-2xl text-balance font-display text-3xl font-extrabold tracking-tight text-brand-foreground sm:text-4xl">
          Готови ли сте да облекчите училищния ден?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-pretty text-lg text-brand-foreground/90">
          Настройката отнема един следобед. Ще ви преведем през всяка стъпка — от
          вписването на учителите до първата оценка.
        </p>

        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 rounded-full bg-background px-7 text-base font-semibold text-foreground hover:bg-background/90"
          >
            Заявете безплатно демо
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-2 border-white/40 bg-transparent px-7 text-base font-semibold text-brand-foreground hover:bg-white/10"
          >
            Разгледайте цените
          </Button>
        </div>
      </div>
    </section>
  )
}
