'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FloatingLabelInput({
  label,
  error,
  className,
  value,
  onChange,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value)
    onChange?.(e)
  }

  return (
    <div className="relative">
      <input
        {...props}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'peer w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg',
          'text-white placeholder-transparent transition-colors duration-200',
          'focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20',
          'hover:border-white/30',
          error && 'border-red-500/50 focus:border-red-500',
          className
        )}
        placeholder={label}
      />
      <label
        className={cn(
          'absolute left-4 transition-all duration-200 pointer-events-none',
          'text-white/60 peer-focus:text-white/80',
          isFocused || hasValue
            ? 'top-1 text-xs'
            : 'top-3 text-sm'
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
