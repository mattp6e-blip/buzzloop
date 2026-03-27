'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[var(--accent)] text-white hover:bg-[#d03d08] hover:-translate-y-px shadow-[0_4px_24px_rgba(232,71,10,0.3)] hover:shadow-[0_6px_28px_rgba(232,71,10,0.4)]':
              variant === 'primary',
            'bg-transparent border border-[var(--border2)] text-[var(--ink2)] hover:bg-[var(--surface2)]':
              variant === 'ghost',
            'bg-transparent border border-[var(--border)] text-[var(--ink2)] hover:border-[var(--border2)] hover:bg-[var(--surface2)]':
              variant === 'outline',
          },
          {
            'text-sm px-4 py-2': size === 'sm',
            'text-sm px-5 py-2.5': size === 'md',
            'text-base px-7 py-3.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
