import { cn } from '@/lib/utils'

const styles: Record<number, string> = {
  6: 'bg-success text-success-foreground',
  5: 'bg-brand-blue text-brand-blue-foreground',
  4: 'bg-warning text-warning-foreground',
  3: 'bg-orange-500 text-white',
  2: 'bg-danger text-danger-foreground',
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
        'inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold shadow-sm',
        styles[value] ?? 'bg-muted text-foreground',
        className,
      )}
    >
      {value}
    </span>
  )
}
