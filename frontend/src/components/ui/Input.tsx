import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  helperText,
  className = '',
  id,
  style,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 w-4 h-4 flex items-center justify-center pointer-events-none text-slate-400 z-10">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            paddingLeft: icon ? '2.75rem' : '0.875rem',
            ...style,
          }}
          className={`
            w-full rounded-xl border text-xs font-semibold transition-all duration-150 outline-none
            bg-white text-slate-900 placeholder:text-slate-400 pr-3.5 py-2.5 shadow-2xs
            ${error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
            }
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  )
})
Input.displayName = 'Input'
