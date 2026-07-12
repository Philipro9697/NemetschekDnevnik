import { Star, Heart, ThumbsUp, Frown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const styles: Record<number, string> = {
  6: 'bg-success text-white',
  5: 'bg-brand-blue text-white',
  4: 'bg-warning text-white',
  3: 'bg-orange-500 text-white',
  2: 'bg-danger text-white',
}

const primaryGradeClassIds = new Set(['c1a', 'c2a', 'c2b'])

function usesIcons(classId?: string) {
  return Boolean(classId && primaryGradeClassIds.has(classId))
}

function GradeIcon({ value }: { value: number }) {
  switch (value) {
    case 6:
      return <Star className="size-4 fill-current" />
    case 5:
      return <Heart className="size-4 fill-current" />
    case 4:
      return <ThumbsUp className="size-4 fill-current" />
    case 3:
      return <Frown className="size-4 stroke-2" />
    case 2:
      return <X className="size-4 stroke-2" />
    default:
      return null
  }
}

export function getGradeIcon(value: number) {
  switch (value) {
    case 6:
      return '⭐'
    case 5:
      return '❤️'
    case 4:
      return '👍'
    case 3:
      return '😊'
    case 2:
      return '❌'
    default:
      return String(value)
  }
}

export function GradePill({
  value,
  className,
  title,
  classId,
}: {
  value: number
  className?: string
  title?: string
  classId?: string
}) {
  const label = title ?? `Оценка ${value}`
  const useIcon = usesIcons(classId)

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg font-bold shadow-sm text-sm',
        styles[value] ?? 'bg-muted text-foreground',
        className,
      )}
    >
      {useIcon ? <GradeIcon value={value} /> : String(value)}
    </span>
  )
}
