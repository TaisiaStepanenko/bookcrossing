import * as React from 'react'

import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-gray-100 text-text-primary hover:bg-gray-200',
  outline: 'bg-transparent border border-gray-300 text-text-primary hover:bg-gray-50',
  ghost: 'bg-transparent text-text-primary hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    leftIcon,
    rightIcon,
    className,
    children,
    type,
    ...props
  },
  ref
) {
  const isDisabled = Boolean(disabled || isLoading)

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition outline-none',
        'focus:ring-2 focus:ring-brand-light focus:ring-offset-2 focus:ring-offset-white',
        'disabled:opacity-60 disabled:pointer-events-none',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
      <span className={cn(isLoading ? 'opacity-0' : undefined)}>{children}</span>
      {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}

      {isLoading ? (
        <span className="absolute inline-flex">
          <svg
            className="h-4 w-4 animate-spin text-current"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
            />
          </svg>
        </span>
      ) : null}
    </button>
  )
})

