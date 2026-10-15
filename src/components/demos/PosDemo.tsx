import { useState } from 'react'
import { btn, btnGhost, input, rupiah, useToast } from './kit'
import { Hint, Num, Window } from './ui'

const PRODUCTS = [
  { id: 'rice', name: 'Beras Premium 5 kg', price: 78_500, stock: 12 },
  { id: 'oil', name: 'Minyak Goreng 2 L', price: 36_900, stock: 8 },
  { id: 'egg', name: 'Telur Ayam 1 kg', price: 29_000, stock: 15 },
  { id: 'milk', name: 'Susu UHT 1 L', price: 18_900, stock: 20 },
  { id: 'noodle', name: 'Mie Instan 5 pcs', price: 15_500, stock: 3 },
  { id: 'coffee', name: 'Kopi Bubuk 200 g', price: 24_000, stock: 6 },
]
const DISCOUNT = 0.05

type Step = 'cart' | 'pay' | 'receipt'
type Line = { id: string; name: string; price: number; qty: number }

export function PosDemo() {
  const [stock, setStock] = useState(() => Object.fromEntries(PRODUCTS.map((p) => [p.id, p.stock])))
  const [cart, setCart] = useState<Record<string, number>>({})
  const [member, setMember] = useState(false)
  const [step, setStep] = useState<Step>('cart')
  const [cash, setCash] = useState('')
  const [receipt, setReceipt] = useState<{ no: number; lines: Line[]; total: number; cash: number } | null>(null)
  const [trx, setTrx] = useState(12)
  const [sales, setSales] = useState(2_845_000)
  const [toastNode, toast] = useToast()

  const lines: Line[] = PRODUCTS.filter((p) => cart[p.id]).map((p) => ({ id: p.id, name: p.name, price: p.price, qty: cart[p.id] }))
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const discount = member ? Math.round(subtotal * DISCOUNT) : 0
  const total = subtotal - discount
  const paid = Number(cash) || 0
  const quickCash = [...new Set([total, Math.ceil(total / 50_000) * 50_000, Math.ceil(total / 100_000) * 100_000, 500_000])].filter((n) => n >= total).slice(0, 3)

  const change = (id: string, delta: number) => {
    if (delta > 0 && stock[id] === 0) return toast('Out of stock. Stock syncs with the warehouse.')
    setStock((s) => ({ ...s, [id]: s[id] - delta }))
    setCart((c) => {
      const qty = (c[id] ?? 0) + delta
      const next = { ...c }
      if (qty > 0) next[id] = qty
      else delete next[id]
      return next
    })
  }

  const complete = () => {
    if (paid < total) return toast('Cash is less than the total.')
    setReceipt({ no: trx + 1, lines, total, cash: paid })
    setTrx((n) => n + 1)
    setSales((n) => n + total)
    setCart({})
    setMember(false)
    setCash('')
    setStep('receipt')
  }

  return (
    <Window title="pos / lane 2">
      <div className="grid grid-cols-2 border-b border-hairline">
        <div className="border-r border-hairline px-3 py-2">
          <p className="text-[11px] text-mute">Transactions today</p>
          <p className="text-sm font-semibold tabular-nums">{trx}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[11px] text-mute">Sales today</p>
          <p className="text-sm font-semibold">
            Rp <Num value={sales} />
          </p>
        </div>
      </div>

      <div className="grid min-h-[330px] sm:grid-cols-[1fr_210px]">
        {/* Products */}
        <div className="border-b border-hairline p-3 sm:border-r sm:border-b-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium">Scan or tap a product</p>
            <Hint show={trx === 12 && lines.length === 0}>Tap to scan</Hint>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => change(p.id, 1)}
                disabled={step !== 'cart' || stock[p.id] === 0}
                className="flex flex-col rounded-md p-2 text-left ring-1 ring-hairline transition hover:bg-canvas-soft active:scale-95 disabled:opacity-45 disabled:active:scale-100"
              >
                <span className="text-[12px] leading-4 font-medium">{p.name}</span>
                <span className="mt-1 font-mono text-[11px]">{rupiah(p.price)}</span>
                <span className={`mt-0.5 text-[10px] ${stock[p.id] <= 3 ? 'text-error' : 'text-mute'}`}>
                  {stock[p.id] === 0 ? 'Out of stock' : `${stock[p.id]} in stock`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cart / payment / receipt */}
        <div className="flex flex-col p-3">
          {step === 'cart' && (
            <>
              <p className="text-[12px] font-medium">Current sale</p>
              <ul className="mt-2 flex-1 space-y-1.5">
                {lines.length === 0 && <li className="text-[12px] text-mute">No items yet.</li>}
                {lines.map((l) => (
                  <li key={l.id} className="scan-in rounded-sm text-[12px]">
                    <p className="truncate">{l.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <button type="button" onClick={() => change(l.id, -1)} aria-label={`Remove one ${l.name}`} className="grid size-5 place-items-center rounded-full ring-1 ring-hairline hover:bg-canvas-soft-2">
                          −
                        </button>
                        <span className="w-4 text-center tabular-nums">{l.qty}</span>
                        <button type="button" onClick={() => change(l.id, 1)} aria-label={`Add one ${l.name}`} className="grid size-5 place-items-center rounded-full ring-1 ring-hairline hover:bg-canvas-soft-2">
                          +
                        </button>
                      </span>
                      <span className="font-mono">{rupiah(l.price * l.qty)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12px]">
                <input type="checkbox" checked={member} onChange={(e) => setMember(e.target.checked)} className="accent-ink" />
                Member discount 5%
              </label>
              <div className="mt-2 space-y-0.5 border-t border-dashed border-hairline-strong pt-2 text-[12px]">
                {member && (
                  <p className="flex justify-between text-mute">
                    <span>Discount</span>
                    <span className="font-mono">−{rupiah(discount)}</span>
                  </p>
                )}
                <p className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>Rp <Num value={total} /></span>
                </p>
              </div>
              <button type="button" disabled={!lines.length} onClick={() => setStep('pay')} className={`${btn} mt-3 w-full py-2`}>
                Pay
              </button>
            </>
          )}

          {step === 'pay' && (
            <div className="step-in flex flex-1 flex-col gap-2">
              <p className="text-[12px] font-medium">Cash payment</p>
              <p className="text-lg font-semibold tracking-[-0.5px]">Rp {rupiah(total)}</p>
              <div className="flex flex-wrap gap-1.5">
                {quickCash.map((n) => (
                  <button key={n} type="button" onClick={() => setCash(String(n))} className={btnGhost}>
                    {n === total ? 'Exact' : rupiah(n)}
                  </button>
                ))}
              </div>
              <input value={cash} onChange={(e) => setCash(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Cash received" aria-label="Cash received" className={input} />
              <p className="flex justify-between text-[12px]">
                <span className="text-mute">Change</span>
                <span className={`font-mono font-medium ${paid >= total ? '' : 'text-mute'}`}>{paid >= total ? rupiah(paid - total) : '—'}</span>
              </p>
              <div className="mt-auto flex gap-1.5">
                <button type="button" onClick={() => setStep('cart')} className={btnGhost}>
                  Back
                </button>
                <button type="button" onClick={complete} disabled={paid < total} className={`${btn} flex-1`}>
                  Complete sale
                </button>
              </div>
            </div>
          )}

          {step === 'receipt' && receipt && (
            <div className="flex flex-1 flex-col">
              <div className="print-in rounded-sm bg-canvas-soft p-3 font-mono text-[11px] shadow-card">
                <p className="text-center font-sans text-[12px] font-semibold">Supermarket Demo</p>
                <p className="text-center text-mute">TRX-{String(receipt.no).padStart(4, '0')}</p>
                <div className="my-2 border-t border-dashed border-hairline-strong" />
                {receipt.lines.map((l) => (
                  <p key={l.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {l.qty}× {l.name}
                    </span>
                    <span>{rupiah(l.qty * l.price)}</span>
                  </p>
                ))}
                <div className="my-2 border-t border-dashed border-hairline-strong" />
                <p className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{rupiah(receipt.total)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Cash</span>
                  <span>{rupiah(receipt.cash)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Change</span>
                  <span>{rupiah(receipt.cash - receipt.total)}</span>
                </p>
              </div>
              <button type="button" onClick={() => setStep('cart')} className={`${btn} mt-auto w-full py-2`}>
                New sale
              </button>
            </div>
          )}
        </div>
      </div>
      {toastNode}
    </Window>
  )
}
