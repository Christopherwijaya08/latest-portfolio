import { useState, type FormEvent } from 'react'
import { reduceMotion } from '../../hooks'
import { btn, input, useToast } from './kit'
import { Hint, Spinner, Window } from './ui'

const DESTINATIONS = [
  { code: 'JP', name: 'Japan', base: 4 },
  { code: 'SG', name: 'Singapore', base: 3 },
  { code: 'KR', name: 'South Korea', base: 4 },
  { code: 'TH', name: 'Thailand', base: 3 },
  { code: 'MY', name: 'Malaysia', base: 2 },
  { code: 'EU', name: 'Europe', base: 5 },
  { code: 'US', name: 'United States', base: 5 },
  { code: 'AU', name: 'Australia', base: 5 },
]
const TIERS = [
  { data: '1 GB', days: 7, mult: 1 },
  { data: '5 GB', days: 15, mult: 3 },
  { data: '10 GB', days: 30, mult: 5 },
]
const PAYMENTS = ['Card', 'QRIS', 'PayPal']

type Destination = (typeof DESTINATIONS)[number]
type Step = 'browse' | 'checkout' | 'paying' | 'done'

const QR = 21
const FINDERS = [[0, 0], [QR - 7, 0], [0, QR - 7]]

/** Finder squares sit in three corners; returns undefined outside them (including the 1-cell margin). */
function finderCell(x: number, y: number) {
  for (const [fx, fy] of FINDERS) {
    const dx = x - fx
    const dy = y - fy
    if (dx < -1 || dy < -1 || dx > 7 || dy > 7) continue
    const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6
    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
    return dx >= 0 && dy >= 0 && dx <= 6 && dy <= 6 && (ring || core)
  }
  return undefined
}

/** Deterministic QR-looking pattern. Decorative only; it does not encode a real eSIM. */
function FakeQr({ seed }: { seed: string }) {
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const cells: [number, number][] = []
  for (let y = 0; y < QR; y++) {
    for (let x = 0; x < QR; x++) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0
      if (finderCell(x, y) ?? (h >>> 16) & 1) cells.push([x, y])
    }
  }
  return (
    <svg viewBox={`-1 -1 ${QR + 2} ${QR + 2}`} className="qr-in size-32 rounded-md bg-white" role="img" aria-label="eSIM QR code (demo)">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#171717" />
      ))}
    </svg>
  )
}

export function EsimDemo() {
  const [step, setStep] = useState<Step>('browse')
  const [query, setQuery] = useState('')
  const [dest, setDest] = useState<Destination | null>(null)
  const [tier, setTier] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [payment, setPayment] = useState(PAYMENTS[0])
  const [orders, setOrders] = useState(0)
  const [orderId, setOrderId] = useState('')
  const [toastNode, toast] = useToast()

  const matches = DESTINATIONS.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()))
  const plan = dest && tier !== null ? { ...TIERS[tier], price: dest.base * TIERS[tier].mult } : null

  const pick = (d: Destination) => {
    setDest(d)
    setTier(1)
  }

  const pay = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Enter a valid email so we can send your eSIM.')
    setStep('paying')
    window.setTimeout(
      () => {
        setOrderId(`RML-${Math.floor(10000 + Math.random() * 89999)}`)
        setOrders((n) => n + 1)
        setStep('done')
      },
      reduceMotion ? 0 : 1400,
    )
  }

  const reset = () => {
    setStep('browse')
    setDest(null)
    setTier(null)
    setQuery('')
  }

  return (
    <Window title="roamly.app / store">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="text-[13px] font-semibold tracking-[-0.3px]">Roamly</span>
        <span className="text-[11px] text-mute">
          My eSIMs <span className="ml-1 rounded-full bg-canvas-soft-2 px-1.5 py-0.5 font-medium text-ink tabular-nums">{orders}</span>
        </span>
      </div>

      <div className="min-h-[340px] p-4">
        {step === 'browse' && (
          <div className="step-in space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium">Where are you going?</p>
              <Hint show={!dest}>Pick a destination</Hint>
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search destinations" aria-label="Search destinations" className={`${input} w-full`} />
            {matches.length === 0 ? (
              <p className="py-4 text-[12px] text-mute">No destinations match “{query}”. Try Japan or Europe.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {matches.map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => pick(d)}
                    aria-pressed={dest?.code === d.code}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition active:scale-95 ${
                      dest?.code === d.code ? 'bg-ink text-on-ink' : 'ring-1 ring-hairline hover:bg-canvas-soft'
                    }`}
                  >
                    <span className={`rounded px-1 font-mono text-[10px] ${dest?.code === d.code ? 'bg-on-ink/15' : 'bg-canvas-soft-2'}`}>{d.code}</span>
                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            )}

            {dest && (
              <div key={dest.code} className="step-in space-y-1.5 pt-1">
                <p className="text-[11px] text-mute">Plans for {dest.name}</p>
                {TIERS.map((t, i) => (
                  <button
                    key={t.data}
                    type="button"
                    onClick={() => setTier(i)}
                    aria-pressed={tier === i}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition ${tier === i ? 'ring-2 ring-ink' : 'ring-1 ring-hairline hover:bg-canvas-soft'}`}
                  >
                    <span>
                      <span className="block text-[13px] font-medium">{t.data}</span>
                      <span className="block text-[11px] text-mute">{t.days} days · 4G/5G</span>
                    </span>
                    <span className="text-sm font-semibold">${dest.base * t.mult}</span>
                  </button>
                ))}
                <button type="button" disabled={!plan} onClick={() => setStep('checkout')} className={`${btn} mt-2 w-full py-2`}>
                  Continue · ${plan?.price}
                </button>
              </div>
            )}
          </div>
        )}

        {(step === 'checkout' || step === 'paying') && dest && plan && (
          <form onSubmit={pay} className="step-in space-y-3">
            <button type="button" onClick={() => setStep('browse')} disabled={step === 'paying'} className="text-[12px] text-link hover:underline">
              ← Change plan
            </button>
            <div className="flex items-center justify-between rounded-md bg-canvas-soft p-3">
              <span>
                <span className="block text-[13px] font-medium">
                  {dest.name} · {plan.data}
                </span>
                <span className="block text-[11px] text-mute">Valid {plan.days} days from first connection</span>
              </span>
              <span className="text-base font-semibold">${plan.price}</span>
            </div>
            <label className="block space-y-1">
              <span className="text-[11px] text-mute">Email for your QR code</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className={`${input} w-full`} />
            </label>
            <fieldset className="space-y-1">
              <legend className="text-[11px] text-mute">Payment method</legend>
              <div className="flex gap-1.5 pt-1">
                {PAYMENTS.map((p) => (
                  <label
                    key={p}
                    className={`flex-1 cursor-pointer rounded-md py-1.5 text-center text-[12px] transition has-focus-visible:ring-2 has-focus-visible:ring-link ${payment === p ? 'bg-ink text-on-ink' : 'ring-1 ring-hairline hover:bg-canvas-soft'}`}
                  >
                    <input type="radio" name="payment" value={p} checked={payment === p} onChange={() => setPayment(p)} className="sr-only" />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" disabled={step === 'paying'} className={`${btn} w-full py-2`}>
              {step === 'paying' ? (
                <>
                  <Spinner /> Processing payment…
                </>
              ) : (
                `Pay $${plan.price} with ${payment}`
              )}
            </button>
          </form>
        )}

        {step === 'done' && dest && plan && (
          <div className="step-in flex flex-col items-center gap-3 py-2 text-center">
            <FakeQr seed={`${orderId}${email}`} />
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.4px]">Your {dest.name} eSIM is ready</p>
              <p className="mt-1 text-[12px] text-mute">
                Scan with your phone camera to install. It activates when you land. Copy sent to {email}.
              </p>
              <p className="mt-2 font-mono text-[11px] text-mute">Order {orderId}</p>
            </div>
            <button type="button" onClick={reset} className={btn}>
              Buy another eSIM
            </button>
          </div>
        )}
      </div>
      {toastNode}
    </Window>
  )
}
