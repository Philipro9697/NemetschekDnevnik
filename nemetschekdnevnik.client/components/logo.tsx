import { GraduationCap } from "lucide-react"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="relative grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/30">
        <GraduationCap className="size-5" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-blue" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
        Aula
      </span>
    </a>
  )
}
