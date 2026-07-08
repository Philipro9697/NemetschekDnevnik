import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  size = 'md',
  variant = 'dark',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}) {
  const box =
    size === 'lg' ? 'size-14' : size === 'sm' ? 'size-8' : 'size-10'
  const icon = size === 'lg' ? 'size-7' : size === 'sm' ? 'size-4' : 'size-5'
  const title =
    size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm',
          box,
        )}
      >
        <GraduationCap className={icon} />
      </div>
      <div className="leading-tight">
        <p
          className={cn(
            'font-heading font-extrabold tracking-tight',
            title,
            variant === 'light' ? 'text-white' : 'text-foreground',
          )}
        >
          Дневник
        </p>
        <p
          className={cn(
            'text-[0.7rem] font-medium',
            variant === 'light' ? 'text-white/60' : 'text-muted-foreground',
          )}
        >
          ОУ „Възраждане"
        </p>
      </div>
    </div>
  )
}
