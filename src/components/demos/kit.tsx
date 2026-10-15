// Non-component helpers shared by the demos.
import { useRef, useState } from 'react'

export const rupiah = (n: number) => Math.round(n).toLocaleString('id-ID')

export const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-on-ink transition hover:bg-ink-hover active:scale-95 disabled:cursor-not-allowed disabled:bg-hairline disabled:text-mute disabled:active:scale-100'
export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink ring-1 ring-hairline transition hover:bg-canvas-soft-2 active:scale-95'
export const input =
  'h-8 min-w-0 rounded-md bg-canvas px-2.5 text-[12px] text-ink ring-1 ring-hairline outline-none placeholder:text-mute focus:ring-2 focus:ring-link'

/** Small status message that pops up inside a demo window. */
export function useToast() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const timer = useRef(0)

  const show = (text: string) => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), text })
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const node = (
    <div role="status" className="pointer-events-none absolute inset-x-0 top-11 z-10 flex justify-center px-3">
      {toast && (
        <p key={toast.id} className="toast rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-on-ink shadow-float">
          {toast.text}
        </p>
      )}
    </div>
  )
  return [node, show] as const
}
