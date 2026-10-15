import { projects, type Project, type ProjectId } from '../data'
import { trackPointer } from '../hooks'
import { EsimDemo } from './demos/EsimDemo'
import { FxDemo } from './demos/FxDemo'
import { HrisDemo } from './demos/HrisDemo'
import { IceDemo } from './demos/IceDemo'
import { PosDemo } from './demos/PosDemo'
import { SectionHead } from './SectionHead'

const demos: Record<ProjectId, () => React.JSX.Element> = { ice: IceDemo, hris: HrisDemo, esim: EsimDemo, pos: PosDemo, fx: FxDemo }

function Stack({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
      {items.map((s) => (
        <li
          key={s}
          className={`rounded-full px-2 py-0.5 font-mono text-xs ${dark ? 'bg-white/10 text-[#d4d4d4]' : 'bg-canvas-soft-2 text-body'}`}
        >
          {s}
        </li>
      ))}
    </ul>
  )
}

function Features({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      {items.map((f) => (
        <li key={f} className="flex gap-2">
          <span className={`mt-2 size-1.5 shrink-0 rounded-full ${dark ? 'bg-cyan' : 'bg-ink'}`} aria-hidden />
          {f}
        </li>
      ))}
    </ul>
  )
}

function Featured({ p }: { p: Project }) {
  const Demo = demos[p.id]
  return (
    <article onPointerMove={trackPointer} className="spot spot-dark reveal rounded-xl bg-band p-6 text-white sm:p-10 dark:ring-1 dark:ring-white/10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm text-[#a1a1a1]">{p.kind}</p>
          <h3 className="mt-2 text-[32px] leading-10 font-semibold tracking-[-1.28px]">{p.name}</h3>
          <p className="mt-4 max-w-[52ch] leading-7 text-[#d4d4d4]">{p.description}</p>
        </div>
        <div className="flex flex-col gap-6 lg:pt-8">
          <Features items={p.features} dark />
          <Stack items={p.stack} dark />
        </div>
      </div>
      <div className="relative z-[1] mt-10">
        <Demo />
      </div>
    </article>
  )
}

function Row({ p, flip }: { p: Project; flip: boolean }) {
  const Demo = demos[p.id]
  return (
    <article onPointerMove={trackPointer} className="spot reveal grid grid-cols-1 overflow-hidden rounded-xl bg-canvas shadow-card lg:grid-cols-[5fr_7fr]">
      <div className={`flex flex-col p-6 sm:p-8 ${flip ? 'lg:order-2' : ''}`}>
        <p className="text-sm text-mute">{p.kind}</p>
        <h3 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.96px]">{p.name}</h3>
        <p className="mt-3 leading-7 text-body">{p.description}</p>
        <div className="mt-6 text-body">
          <Features items={p.features} />
        </div>
        <div className="mt-auto pt-8">
          <Stack items={p.stack} />
        </div>
      </div>
      <div className="relative z-[1] bg-canvas-soft-2 p-4 sm:p-8">
        <Demo />
      </div>
    </article>
  )
}

export function Projects() {
  const [featured, ...rest] = projects
  return (
    <section id="projects" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
      <SectionHead
        title="Selected projects. Try them."
        lead="Each screen below is a working demo with dummy data. Deliver ice, clock in, buy an eSIM, ring up groceries or trade dollars. Reload the page to start over."
      />
      <div className="mt-12 space-y-6">
        <Featured p={featured} />
        {rest.map((p, i) => (
          <Row key={p.id} p={p} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
