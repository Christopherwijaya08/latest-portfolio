import { useState, type FormEvent } from 'react'
import { useLive } from '../../hooks'
import { btn, input, rupiah, useToast } from './kit'
import { Hint, Num, Window } from './ui'

const RATES = [
  // code, buy, sell, tick size
  { code: 'USD', buy: 16180, sell: 16320, step: 10 },
  { code: 'SGD', buy: 12410, sell: 12560, step: 10 },
  { code: 'MYR', buy: 3640, sell: 3720, step: 5 },
  { code: 'EUR', buy: 17520, sell: 17700, step: 10 },
]
const VAULT_START: Record<string, number> = { USD: 5000, SGD: 3000, MYR: 10000, EUR: 2000 }

type Mode = 'buy' | 'sell' // from the counter's side: we buy from / sell to the customer
type Trx = { id: number; time: string; mode: Mode; code: string; amount: number; idr: number }

// Deterministic wobble so the board moves like a live feed without randomness.
const wobble = (i: number, t: number) => Math.round(Math.sin(t * 1.7 + i * 2.3) * 2)

export function FxDemo() {
  const { ref, tick } = useLive<HTMLDivElement>(2200)
  const [code, setCode] = useState('USD')
  const [mode, setMode] = useState<Mode>('buy')
  const [amount, setAmount] = useState('100')
  const [vault, setVault] = useState(VAULT_START)
  const [log, setLog] = useState<Trx[]>([])
  const [margin, setMargin] = useState(1_250_000)
  const [touched, setTouched] = useState(false)
  const [toastNode, toast] = useToast()

  const rates = RATES.map((r, i) => {
    const delta = wobble(i, tick) * r.step
    const dir = tick === 0 ? 0 : Math.sign(delta - wobble(i, tick - 1) * r.step)
    return { ...r, buy: r.buy + delta, sell: r.sell + delta, dir }
  })
  const rate = rates.find((r) => r.code === code)!
  const qty = Number(amount) || 0
  const unit = mode === 'buy' ? rate.buy : rate.sell
  const idr = qty * unit

  const record = (e: FormEvent) => {
    e.preventDefault()
    if (qty <= 0 || qty > 10_000) return toast('Enter an amount between 1 and 10,000.')
    if (mode === 'sell' && qty > vault[code]) return toast(`Not enough ${code} in the vault.`)
    const mid = (rate.buy + rate.sell) / 2
    setVault((v) => ({ ...v, [code]: v[code] + (mode === 'buy' ? qty : -qty) }))
    setMargin((m) => m + Math.abs(mid - unit) * qty)
    setLog((l) => [{ id: Date.now(), time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), mode, code, amount: qty, idr }, ...l].slice(0, 4))
    setTouched(true)
    toast(`Recorded: ${mode === 'buy' ? 'bought' : 'sold'} ${qty.toLocaleString('en-US')} ${code}`)
  }

  return (
    <Window ref={ref} title="exchange / counter 1" live>
      <div className="grid grid-cols-2 border-b border-hairline">
        <div className="border-r border-hairline px-3 py-2">
          <p className="text-[11px] text-mute">Transactions today</p>
          <p className="text-sm font-semibold tabular-nums">{37 + log.length}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[11px] text-mute">Margin today</p>
          <p className="text-sm font-semibold">
            Rp <Num value={margin} />
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_230px]">
        {/* Rate board */}
        <div className="border-b border-hairline sm:border-r sm:border-b-0">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-canvas-soft text-[11px] text-mute">
              <tr>
                <th className="px-3 py-2 font-normal">Currency</th>
                <th className="px-3 py-2 text-right font-normal">We buy</th>
                <th className="px-3 py-2 text-right font-normal">We sell</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rates.map((r) => {
                const tone = r.dir > 0 ? 'text-link' : r.dir < 0 ? 'text-error' : ''
                const active = r.code === code
                return (
                  <tr
                    key={r.code}
                    onClick={() => (setCode(r.code), setTouched(true))}
                    className={`cursor-pointer transition-colors ${active ? 'bg-link-bg-soft/50' : 'hover:bg-canvas-soft'}`}
                  >
                    <td className="px-3 py-2 font-medium">
                      <button type="button" aria-pressed={active} className="rounded-sm">
                        {r.code}
                      </button>
                      <span className={`ml-1.5 text-[10px] ${tone}`} aria-hidden>
                        {r.dir > 0 ? '▲' : r.dir < 0 ? '▼' : ''}
                      </span>
                    </td>
                    <td key={`b${tick}`} className={`tick px-3 py-2 text-right font-mono ${tone}`}>
                      {rupiah(r.buy)}
                    </td>
                    <td key={`s${tick}`} className={`tick px-3 py-2 text-right font-mono ${tone}`}>
                      {rupiah(r.sell)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-3 py-2">
            <Hint show={!touched}>Pick a currency, then record a trade</Hint>
          </div>
        </div>

        {/* Converter */}
        <form onSubmit={record} className="space-y-2.5 p-3">
          <div className="grid grid-cols-2 rounded-full bg-canvas-soft-2 p-0.5 text-[12px]">
            {(['buy', 'sell'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-full py-1 transition ${mode === m ? 'bg-canvas font-medium shadow-card' : 'text-body'}`}
              >
                {m === 'buy' ? 'Customer sells' : 'Customer buys'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              aria-label={`Amount in ${code}`}
              className={`${input} w-full font-mono`}
            />
            <span className="text-[12px] font-medium">{code}</span>
          </label>
          <div className="rounded-md bg-canvas-soft p-2.5">
            <p className="text-[11px] text-mute">
              {mode === 'buy' ? 'Teller pays customer' : 'Customer pays teller'} at {rupiah(unit)}
            </p>
            <p key={`${tick}${code}${mode}`} className="tick text-base font-semibold tracking-[-0.4px] tabular-nums">
              Rp {rupiah(idr)}
            </p>
          </div>
          <p className="text-[11px] text-mute">
            Vault: {vault[code].toLocaleString('en-US')} {code}
          </p>
          <button type="submit" className={`${btn} w-full py-2`}>
            Record transaction
          </button>
        </form>
      </div>

      {log.length > 0 && (
        <ul className="divide-y divide-hairline border-t border-hairline text-[12px]">
          {log.map((t) => (
            <li key={t.id} className="scan-in flex items-center justify-between gap-2 px-3 py-1.5">
              <span className="font-mono text-[11px] text-mute">{t.time}</span>
              <span className="flex-1">
                {t.mode === 'buy' ? 'Bought' : 'Sold'} {t.amount.toLocaleString('en-US')} {t.code}
              </span>
              <span className="font-mono">Rp {rupiah(t.idr)}</span>
            </li>
          ))}
        </ul>
      )}
      {toastNode}
    </Window>
  )
}
