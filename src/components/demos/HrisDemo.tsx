import { useState, type FormEvent } from 'react'
import { btn, btnGhost, input, useToast } from './kit'
import { Hint, Num, Window } from './ui'

type Status = 'present' | 'leave' | 'absent' | null // null = not employed yet that day
type Employee = { id: number; name: string; role: string; days: Status[] }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const TODAY = DAYS.length - 1
const ROLES = ['Staff', 'Driver', 'Cashier', 'Supervisor']
const MAX_ROWS = 7
const NEXT: Record<Exclude<Status, null>, Exclude<Status, null>> = { present: 'leave', leave: 'absent', absent: 'present' }
const LABEL = { present: 'Present', leave: 'Leave', absent: 'Absent' }
const FILL = { present: 'bg-ink', leave: 'bg-violet', absent: 'bg-hairline' }

const seed = (p: number, d: number): Status => ((p * 7 + d * 3) % 11 === 0 ? 'leave' : (p + d * 5) % 13 === 0 ? 'absent' : 'present')
const FIRST: Employee[] = [
  ['Andi', 'Supervisor'],
  ['Sari', 'Cashier'],
  ['Budi', 'Driver'],
  ['Maya', 'Staff'],
  ['Rudi', 'Driver'],
].map(([name, role], p) => ({ id: p + 1, name, role, days: DAYS.map((_, d) => seed(p, d)) }))

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-r border-hairline px-3 py-2 last:border-r-0">
      <p className="text-[11px] text-mute">{label}</p>
      <p className="text-sm font-semibold tracking-[-0.28px] tabular-nums">{children}</p>
    </div>
  )
}

export function HrisDemo() {
  const [people, setPeople] = useState(FIRST)
  const [name, setName] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [clockedAt, setClockedAt] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [toastNode, toast] = useToast()

  const today = people.map((p) => p.days[TODAY])
  const presentToday = today.filter((s) => s === 'present').length
  const leaveToday = today.filter((s) => s === 'leave').length
  const all = people.flatMap((p) => p.days).filter((s) => s !== null)
  const rate = all.length ? (all.filter((s) => s === 'present').length / all.length) * 100 : 0

  const cycle = (id: number, d: number) => {
    setTouched(true)
    setPeople((list) =>
      list.map((p) => (p.id === id ? { ...p, days: p.days.map((s, i) => (i === d && s ? NEXT[s] : s)) } : p)),
    )
  }

  const add = (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return toast('Enter the new employee’s name.')
    if (people.length >= MAX_ROWS) return toast('Demo is full. Remove someone first.')
    // New hires have no history yet; they start today as absent until they clock in.
    setPeople((list) => [...list, { id: Date.now(), name: n, role, days: DAYS.map((_, d) => (d === TODAY ? 'absent' : null)) }])
    setName('')
    setTouched(true)
    toast(`${n} added as ${role}`)
  }

  const remove = (p: Employee) => {
    setPeople((list) => list.filter((x) => x.id !== p.id))
    if (p.name === 'You') setClockedAt(null)
    toast(`${p.name} removed`)
  }

  const clockIn = () => {
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const me = people.find((p) => p.name === 'You')
    if (!me && people.length >= MAX_ROWS) return toast('Demo is full. Remove someone first.')
    setPeople((list) =>
      me
        ? list.map((p) => (p === me ? { ...p, days: p.days.map((s, i) => (i === TODAY ? 'present' : s)) } : p))
        : [...list, { id: Date.now(), name: 'You', role: 'Visitor', days: DAYS.map((_, d) => (d === TODAY ? 'present' : null)) }],
    )
    setClockedAt(time)
    setTouched(true)
    toast(`Clocked in at ${time}. Welcome!`)
  }

  return (
    <Window title="hris / attendance">
      <div className="grid grid-cols-3 border-b border-hairline">
        <Stat label="Present today">
          {presentToday} of {people.length}
        </Stat>
        <Stat label="On leave today">{leaveToday}</Stat>
        <Stat label="Attendance rate">
          <Num value={rate} format={(n) => `${n.toFixed(1)}%`} />
        </Stat>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Hint show={!touched}>Click any cell to change status</Hint>
          <div className="ml-auto flex gap-3 text-[11px] text-mute">
            {(['present', 'leave', 'absent'] as const).map((s) => (
              <span key={s} className="flex items-center gap-1">
                <i className={`size-2 rounded-[2px] ${FILL[s]}`} />
                {LABEL[s]}
              </span>
            ))}
          </div>
        </div>

        <table className="w-full min-w-[440px] border-separate border-spacing-1 text-[11px]">
          <thead>
            <tr className="text-mute">
              <th className="w-24 text-left font-normal">Employee</th>
              {DAYS.map((d, i) => (
                <th key={i} className={`font-normal ${i === TODAY ? 'font-medium text-link' : ''}`}>
                  {i === TODAY ? 'Today' : d.slice(0, 1)}
                </th>
              ))}
              <th className="w-5" />
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="group scan-in">
                <td className="pr-1">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="truncate text-mute">{p.role}</p>
                </td>
                {p.days.map((s, d) => (
                  <td key={d} className={d === TODAY ? 'rounded bg-link-bg-soft/50' : ''}>
                    {s ? (
                      <button
                        type="button"
                        onClick={() => cycle(p.id, d)}
                        title={`${p.name}, ${DAYS[d]}: ${LABEL[s]}`}
                        aria-label={`${p.name}, ${d === TODAY ? 'today' : DAYS[d]}: ${LABEL[s]}. Click to change.`}
                        className={`pop block h-5 w-full min-w-5 rounded-[4px] transition hover:scale-110 hover:ring-2 hover:ring-link/40 ${FILL[s]}`}
                        key={s}
                      />
                    ) : (
                      <span className="block h-5 w-full min-w-5 rounded-[4px] border border-dashed border-hairline-strong/50" title="Not employed yet" />
                    )}
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    aria-label={`Remove ${p.name}`}
                    className="grid size-5 place-items-center rounded-full text-mute opacity-0 transition group-hover:opacity-100 hover:bg-canvas-soft-2 hover:text-error focus-visible:opacity-100"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-hairline p-3">
        <form onSubmit={add} className="flex flex-1 flex-wrap items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="New employee name" aria-label="New employee name" className={`${input} flex-1`} />
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" className={`${input} pr-1`}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button type="submit" className={btnGhost}>
            Add employee
          </button>
        </form>
        <button type="button" onClick={clockIn} disabled={!!clockedAt} className={btn}>
          {clockedAt ? `Clocked in ${clockedAt} ✓` : 'Clock in as visitor'}
        </button>
      </div>
      {toastNode}
    </Window>
  )
}
