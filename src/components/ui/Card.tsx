import React from 'react'
import { cn } from '@/lib/utils'

export type CardVariant = 'default' | 'elevated' | 'glass'
export type CardPadding = 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
  padding?: CardPadding
  children: React.ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: 'glass-card',
  elevated: 'glass-elevated',
  glass: 'glass-card',
}

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hover = true,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'rounded-xl transition-all duration-300',
          variantStyles[variant],
          hover && 'hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/20',
          paddingStyles[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
