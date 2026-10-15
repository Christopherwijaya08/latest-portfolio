import { useEffect, useRef, useState } from 'react'

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)

/** Counter that ticks every `ms` while the element is on screen. Stays at 0 for reduced motion. */
export function useLive<T extends Element>(ms: number) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || reduceMotion) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [visible, ms])

  return { ref, tick, visible }
}

/** True once the element has been on screen. */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(reduceMotion)

  useEffect(() => {
    const el = ref.current
    if (!el || reduceMotion) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, seen }
}

/** Smoothly follows `target` whenever it changes. Jumps straight there for reduced motion. */
export function useTween(target: number, ms = 900) {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    if (reduceMotion) return
    const from = current.current
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      current.current = from + (target - from) * easeOut(p)
      setValue(current.current)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  return reduceMotion ? target : value
}

/** Writes the pointer position into --x / --y on the element, for the card spotlight. */
export function trackPointer(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
}
