import * as React from 'react'
import { cn } from '@/lib/utils'

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div ref={ref} className={cn('relative inline-block', sizeClasses[size], className)} {...props}>
      <div
        className="absolute inset-0 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  )
})
Spinner.displayName = 'Spinner'

export { Spinner }
