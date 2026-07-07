'use client'

import { cn } from '@/lib/utils'

function Tabs({
  tabs,
  value,
  onValueChange,
  className,
}: {
  tabs: { value: string; label: string; icon?: React.ReactNode }[]
  value: string
  onValueChange: (v: string) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1',
        className,
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(t.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

export { Tabs }
