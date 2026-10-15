import { useState, type FormEvent } from 'react'
import { reduceMotion, useTween } from '../../hooks'
import { btn, input, useToast } from './kit'
import { Hint, Num, Spinner, Window } from './ui'

/* ---------- Route geometry: three cubic curves, sampled into a lookup table ---------- */

type Pt = [number, number]
const ROUTE = 'M20 150 C 70 150, 70 60, 130 60 C 190 60, 200 125, 250 85 C 300 45, 320 35, 380 45'
const CURVES: [Pt, Pt, Pt, Pt][] = [
  [[20, 150], [70, 150], [70, 60], [130, 60]],
  [[130, 60], [190, 60], [200, 125], [250, 85]],
  [[250, 85], [300, 45], [320, 35], [380, 45]],
]

const bezier = ([a, b, c, d]: [Pt, Pt, Pt, Pt], t: number): Pt => {
  const u = 1 - t
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]]
}

const SAMPLES: { p: Pt; len: number }[] = []
for (const curve of CURVES) {
  for (let i = SAMPLES.length ? 1 : 0; i <= 60; i++) {
    const p = bezier(curve, i / 60)
    const prev = SAMPLES.at(-1)
    SAMPLES.push({ p, len: prev ? prev.len + Math.hypot(p[0] - prev.p[0], p[1] - prev.p[1]) : 0 })
  }
}
const TOTAL = SAMPLES.at(-1)!.len

/** Point and heading at fraction `f` (0..1) of the route length. */
function pointAt(f: number) {
  const target = Math.min(Math.max(f, 0), 1) * TOTAL
  const i = Math.max(1, SAMPLES.findIndex((s) => s.len >= target))
  const a = SAMPLES[i - 1]
  const b = SAMPLES[i] ?? a
  const t = b.len === a.len ? 0 : (target - a.len) / (b.len - a.len)
  return {
    x: a.p[0] + (b.p[0] - a.p[0]) * t,
    y: a.p[1] + (b.p[1] - a.p[1]) * t,
    angle: (Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]) * 180) / Math.PI,
  }
}

// Stops are spread evenly along the route, so the map re-flows when orders are added.
const stopFraction = (i: number, n: number) => (n === 1 ? 0.5 : 0.14 + (i / (n - 1)) * 0.84)

/* ---------- Data ---------- */

type Stop = { id: number; name: string; bags: number; done: boolean }

const PRICE_PER_BAG = 12_000
const MAX_STOPS = 6
const FIRST_ROUTE: Stop[] = [
  { id: 1, name: 'Toko Sinar Jaya', bags: 40, done: true },
  { id: 2, name: 'Warung Bu Ani', bags: 15, done: true },
  { id: 3, name: 'RM Padang Sederhana', bags: 25, done: false },
  { id: 4, name: 'Cafe Kopi Kita', bags: 10, done: false },
]
const NEXT_ROUTE: Omit<Stop, 'id' | 'done'>[] = [
  { name: 'Hotel Grand Kesawan', bags: 60 },
  { name: 'Es Teh Mantap', bags: 20 },
  { name: 'Bakso Pak Kumis', bags: 15 },
]

const jt = (n: number) => `Rp ${(n / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} jt`

/* ---------- Demo ---------- */

export function IceDemo() {
  const [stops, setStops] = useState(FIRST_ROUTE)
  const [stock, setStock] = useState(1240)
  const [sales, setSales] = useState(4_300_000)
  const [selected, setSelected] = useState<number | null>(null)
  const [delivering, setDelivering] = useState<number | null>(null)
  const [lastId, setLastId] = useState<number | null>(2)
  const [name, setName] = useState('')
  const [bags, setBags] = useState('20')
  const [touched, setTouched] = useState(false)
  const [toastNode, toast] = useToast()

  const index = (id: number | null) => stops.findIndex((s) => s.id === id)
  const truckTarget = (() => {
    const i = index(delivering ?? lastId)
    return i < 0 ? 0 : stopFraction(i, stops.length)
  })()
  const truck = pointAt(useTween(truckTarget, 1300))

  const done = stops.filter((s) => s.done).length
  const allDone = done === stops.length
  const current = stops.find((s) => s.id === (delivering ?? selected))

  const select = (s: Stop) => {
    if (s.done || delivering) return
    setTouched(true)
    setSelected(s.id === selected ? null : s.id)
  }

  const deliver = () => {
    const stop = stops.find((s) => s.id === selected)
    if (!stop || delivering) return
    if (stop.bags > stock) {
      toast('Not enough ice in stock. Restock first.')
      return
    }
    setDelivering(stop.id)
    window.setTimeout(
      () => {
        setStops((all) => all.map((s) => (s.id === stop.id ? { ...s, done: true } : s)))
        setStock((n) => n - stop.bags)
        setSales((n) => n + stop.bags * PRICE_PER_BAG)
        setLastId(stop.id)
        setDelivering(null)
        setSelected(null)
        toast(`Delivered ${stop.bags} bags to ${stop.name}`)
      },
      reduceMotion ? 0 : 1300,
    )
  }

  const newRoute = () => {
    setStops(NEXT_ROUTE.map((s, i) => ({ ...s, id: Date.now() + i, done: false })))
    setLastId(null)
    toast('New route loaded. Truck heads back to cold storage.')
  }

  const addOrder = (e: FormEvent) => {
    e.preventDefault()
    const customer = name.trim()
    const qty = Number(bags)
    if (!customer) return toast('Enter a customer name.')
    if (!Number.isInteger(qty) || qty < 1 || qty > 200) return toast('Bags must be between 1 and 200.')
    if (stops.length >= MAX_STOPS) return toast('Route is full. Deliver the rest or start a new route.')
    setStops((all) => [...all, { id: Date.now(), name: customer, bags: qty, done: false }])
    setName('')
    setTouched(true)
    toast(`Order for ${customer} sent to the driver`)
  }

  const restock = () => {
    setStock((n) => n + 500)
    toast('Cold storage restocked: +500 bags')
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_220px]">
      {/* Admin dashboard */}
      <Window title="admin / tracking" live>
        <div className="grid grid-cols-3 border-b border-hairline">
          <div className="border-r border-hairline px-3 py-2">
            <p className="flex items-center justify-between gap-1 text-[11px] text-mute">
              Ice in stock
              <button type="button" onClick={restock} className="rounded-full px-1.5 text-[11px] font-medium text-link hover:bg-link-bg-soft">
                +500
              </button>
            </p>
            <p className="text-sm font-semibold tracking-[-0.28px]">
              <Num value={stock} format={(n) => `${Math.round(n).toLocaleString('en-US')} bags`} />
            </p>
          </div>
          <div className="border-r border-hairline px-3 py-2">
            <p className="text-[11px] text-mute">Stops done</p>
            <p className="text-sm font-semibold tracking-[-0.28px] tabular-nums">
              {done} of {stops.length}
            </p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[11px] text-mute">Sales today</p>
            <p className="text-sm font-semibold tracking-[-0.28px]">
              <Num value={sales} format={jt} />
            </p>
          </div>
        </div>

        <svg viewBox="0 0 400 190" className="block w-full bg-canvas-soft" role="group" aria-label="Delivery map">
          {[30, 70, 110, 150].map((y) => (
            <line key={y} x1="0" x2="400" y1={y} y2={y} className="stroke-hairline" />
          ))}
          {[60, 140, 220, 300].map((x) => (
            <line key={x} y1="0" y2="190" x1={x} x2={x} className="stroke-hairline" />
          ))}
          <path d={ROUTE} fill="none" className="stroke-link-bg-soft" strokeWidth="6" strokeLinecap="round" />
          <path d={ROUTE} pathLength={1} className="route-draw stroke-link" fill="none" strokeWidth="2" />

          <rect x="8" y="160" width="24" height="16" rx="3" className="fill-ink" />
          <text x="36" y="173" fontSize="9" className="fill-mute">
            Cold storage
          </text>

          {stops.map((s, i) => {
            const { x, y } = pointAt(stopFraction(i, stops.length))
            const active = s.id === selected || s.id === delivering
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={s.done ? -1 : 0}
                aria-label={`${s.name}, ${s.bags} bags${s.done ? ', delivered' : ''}`}
                aria-pressed={active}
                onClick={() => select(s)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), select(s))}
                className={s.done ? '' : 'cursor-pointer'}
                style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.6s cubic-bezier(.2,.7,.2,1)' }}
              >
                {active && <circle r="13" opacity="0.18" className="ping fill-link" />}
                <circle r="11" fill="transparent" />
                <circle
                  r={active ? 7 : 6}
                  className={s.done ? 'fill-link stroke-link' : 'fill-canvas stroke-ink'}
                  strokeWidth="2"
                />
                {s.done && <path d="M-2.6 0.2 L-0.6 2.2 L2.8 -1.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />}
                {active && (
                  <text y="-14" textAnchor={x > 320 ? "end" : x < 80 ? "start" : "middle"} x={x > 320 ? 8 : x < 80 ? -8 : 0} fontSize="10" fontWeight="600" className="fill-ink stroke-canvas-soft" strokeWidth="3" paintOrder="stroke">
                    {s.name}
                  </text>
                )}
              </g>
            )
          })}

          <g style={{ transform: `translate(${truck.x}px, ${truck.y}px) rotate(${truck.angle}deg)` }}>
            {delivering && <circle r="14" opacity="0.15" className="ping fill-link" />}
            <rect x="-10" y="-6" width="20" height="12" rx="3" className="fill-ink" />
            <rect x="5" y="-5" width="4" height="10" rx="1.5" fill="#50e3c2" />
          </g>
        </svg>

        <form onSubmit={addOrder} className="flex flex-wrap items-center gap-2 border-t border-hairline p-3">
          <span className="text-[12px] font-medium">New order</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Customer name" aria-label="Customer name" className={`${input} flex-1`} />
          <input
            value={bags}
            onChange={(e) => setBags(e.target.value)}
            type="number"
            min={1}
            max={200}
            aria-label="Bags of ice"
            className={`${input} w-16`}
          />
          <button type="submit" className={btn}>
            Assign to driver
          </button>
        </form>
        {toastNode}
      </Window>

      {/* Driver app */}
      <div className="w-[220px] justify-self-center rounded-[30px] bg-[#2a2a2a] p-2 shadow-float">
        <div className="overflow-hidden rounded-[24px] bg-canvas text-left text-ink">
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-hairline" />
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-mute">Route 3 · BK 9182 KL</p>
              <Hint show={!touched}>Tap a stop</Hint>
            </div>
            <p className="truncate text-sm font-semibold tracking-[-0.28px]" aria-live="polite">
              {delivering && current ? `Driving to ${current.name}…` : allDone ? 'Route complete' : `${done} of ${stops.length} stops done`}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline">
              <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${(done / stops.length) * 100}%` }} />
            </div>
          </div>

          <ul className="divide-y divide-hairline border-y border-hairline">
            {stops.map((s) => {
              const active = s.id === selected || s.id === delivering
              return (
                <li key={s.id} className="scan-in">
                  <button
                    type="button"
                    onClick={() => select(s)}
                    disabled={s.done || !!delivering}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${active ? 'bg-link-bg-soft/60' : 'hover:bg-canvas-soft'} ${s.done ? 'cursor-default' : ''}`}
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded-full text-[9px] transition-all ${
                        s.done ? 'bg-link text-white' : active ? 'border-[5px] border-link' : 'border border-hairline-strong'
                      }`}
                      aria-hidden
                    >
                      {s.done ? '✓' : ''}
                    </span>
                    <span className={`flex-1 truncate text-[12px] ${s.done ? 'text-mute line-through' : ''}`}>{s.name}</span>
                    <span className="font-mono text-[11px] text-mute">{s.bags}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="p-3">
            {allDone ? (
              <button type="button" onClick={newRoute} className={`${btn} w-full py-2`}>
                Start new route
              </button>
            ) : (
              <button type="button" onClick={deliver} disabled={!selected || !!delivering} className={`${btn} w-full py-2`}>
                {delivering ? (
                  <>
                    <Spinner /> Delivering…
                  </>
                ) : selected ? (
                  'Mark delivered'
                ) : (
                  'Select a stop'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
