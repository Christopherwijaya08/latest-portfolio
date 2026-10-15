// Shared pieces for the interactive project demos. All demo data is dummy and lives in memory.
import type { ReactNode, Ref } from 'react'
import { useSeen, useTween } from '../../hooks'
import { rupiah } from './kit'

export function Window({
  title,
  children,
  live,
  className = '',
  ref,
}: {
  title: string
  children: ReactNode
  live?: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div ref={ref} className={`relative overflow-hidden rounded-lg bg-canvas text-left text-ink shadow-float ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-hairline px-3 py-2">
        <span className="size-2 rounded-full bg-hairline" />
        <span className="size-2 rounded-full bg-hairline" />
        <span className="size-2 rounded-full bg-hairline" />
        <span className="ml-2 truncate font-mono text-[11px] text-mute">{title}</span>
        {live && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-mute">
            <span className="live-dot size-1.5 rounded-full bg-cyan-deep" aria-hidden />
            Live
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

/** A number that counts up when first seen and glides to every new value after that. */
export function Num({ value, format = (n) => rupiah(n) }: { value: number; format?: (n: number) => string }) {
  const { ref, seen } = useSeen<HTMLSpanElement>()
  const shown = useTween(seen ? value : 0, 900)
  return (
    <span ref={ref} className="tabular-nums">
      {format(shown)}
    </span>
  )
}

/** "Try it" nudge, shown until the visitor first interacts. */
export function Hint({ children, show }: { children: ReactNode; show: boolean }) {
  if (!show) return null
  return (
    <span className="hint inline-flex items-center gap-1.5 rounded-full bg-link-bg-soft px-2 py-0.5 text-[11px] font-medium text-link-deep">
      <span className="size-1.5 rounded-full bg-link" aria-hidden />
      {children}
    </span>
  )
}

export function Spinner() {
  return <span className="spin size-3 rounded-full border-2 border-on-ink/30 border-t-on-ink" aria-hidden />
}
