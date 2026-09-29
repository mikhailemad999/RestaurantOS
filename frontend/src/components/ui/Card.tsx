import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  variant?: 'default' | 'elevated' | 'flat'
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  icon,
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden
        ${variant === 'elevated'
          ? 'shadow-md shadow-slate-900/5'
          : variant === 'flat'
          ? 'bg-slate-50 border-slate-200'
          : 'shadow-xs'
        }
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}
