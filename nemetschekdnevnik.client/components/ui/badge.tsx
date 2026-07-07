import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        blue: 'border-transparent bg-brand-blue/10 text-brand-blue',
        green: 'border-transparent bg-success/12 text-success',
        warning: 'border-transparent bg-warning/20 text-warning-foreground',
        danger: 'border-transparent bg-danger/12 text-danger',
        neutral: 'border-border bg-muted text-muted-foreground',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'neutral'

const toneToVariant: Record<Tone, NonNullable<VariantProps<typeof badgeVariants>['variant']>> = {
  primary: 'default',
  success: 'green',
  danger: 'danger',
  warning: 'warning',
  accent: 'blue',
  neutral: 'neutral',
}

function Badge({
  className,
  variant,
  tone,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { tone?: Tone }) {
  const resolved = tone ? toneToVariant[tone] : variant
  return (
    <span className={cn(badgeVariants({ variant: resolved }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
