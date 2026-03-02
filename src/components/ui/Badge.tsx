import React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'emerald' | 'blue' | 'amber' | 'slate' | 'rose'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'glass bg-blue-500/10 text-blue-300 border-blue-500/30 backdrop-blur-md',
  blue: 'glass bg-blue-500/10 text-blue-300 border-blue-500/30 backdrop-blur-md',
  amber: 'glass bg-amber-500/10 text-amber-300 border-amber-500/30 backdrop-blur-md',
  slate: 'glass bg-slate-600/10 text-slate-300 border-slate-600/30 backdrop-blur-md',
  rose: 'glass bg-rose-500/10 text-rose-300 border-rose-500/30 backdrop-blur-md',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

const dotColors: Record<BadgeVariant, string> = {
  emerald: 'bg-blue-400',
  blue: 'bg-blue-400',
  amber: 'bg-amber-400',
  slate: 'bg-slate-400',
  rose: 'bg-rose-400',
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant = 'emerald', size = 'md', dot, children, ...props },
    ref
  ) => {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 font-semibold rounded-full transition-colors duration-200',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {dot && (
          <div className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
        )}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
