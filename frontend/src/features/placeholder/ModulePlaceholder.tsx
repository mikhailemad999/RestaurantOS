import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LucideIcon, Sparkles } from 'lucide-react'

interface ModulePlaceholderProps {
  title: string
  description: string
  phaseNumber: number
  phaseName: string
  icon: LucideIcon
  features: string[]
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  description,
  phaseNumber,
  phaseName,
  icon: Icon,
  features,
}) => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Icon className="w-5 h-5 text-[var(--color-accent)]" />
            {title}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {description}
          </p>
        </div>
        <Badge variant="accent" size="md">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Phase {phaseNumber} — {phaseName}
        </Badge>
      </div>

      <Card>
        <div className="p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            {title} System Ready for Next Phase
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            Core database architecture and permission hooks are wired into backend. Feature UI is scheduled for execution in the roadmap:
          </p>

          <div className="mt-6 text-left p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Planned Capabilities:
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
