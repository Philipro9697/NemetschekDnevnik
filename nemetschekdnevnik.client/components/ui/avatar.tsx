import { cn } from '@/lib/utils'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const palette = [
  'bg-brand-blue/15 text-brand-blue',
  'bg-primary/15 text-primary',
  'bg-warning/25 text-warning-foreground',
  'bg-danger/12 text-danger',
  'bg-chart-5/15 text-foreground',
]

function colorFor(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return palette[sum % palette.length]
}

function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold',
        !src && colorFor(name),
        className,
      )}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src || '/placeholder.svg'} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  )
}

export { Avatar }
