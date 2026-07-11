import { cn } from '@/lib/utils'

const styles: Record<number, string> = {
  6: 'bg-success text-white',
  5: 'bg-brand-blue text-white',
  4: 'bg-warning text-white',
  3: 'bg-orange-500 text-white',
  2: 'bg-danger text-white',
}

export function GradePill({
  value,
  className,
  title,
}: {
  value: number
  className?: string
  title?: string
}) {
  const label = title ?? `Оценка ${value}`

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md border border-transparent px-2 text-sm font-bold shadow-none',
        styles[value] ?? 'bg-muted text-foreground',
        className,
      )}
    >
      {value}
    </span>
  )
}
