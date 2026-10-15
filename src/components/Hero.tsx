import { useRef, useState } from 'react'
import { experience, profile } from '../data'

// PHOTO marks where the portrait pill sits inside the headline.
const HEADLINE = 'I PHOTO build the software behind deliveries, cashiers and payrolls.'.split(' ')
// Entrance order: badge, headline words (photo included), summary, buttons.
const AFTER_HEADLINE = HEADLINE.length + 1

const order = (i: number) => ({ '--i': i }) as React.CSSProperties

/** Portrait cropped into a pill that sits in the headline. Sized in em so it scales with the type. */
function PhotoPill({ i }: { i: number }) {
  const [missing, setMissing] = useState(false)
  const pill =
    'intro inline-block h-[0.82em] w-[1.7em] rounded-full align-[-0.06em] shadow-float ring-1 ring-black/5 transition-transform duration-300 hover:-rotate-3 hover:scale-110'

  if (missing) {
    return <span style={order(i)} className={`${pill} bg-[linear-gradient(120deg,#007cf0,#7928ca,#ff0080)]`} aria-hidden />
  }
  // The source is a half-body shot, so the pill zooms in on the face (around 49% x, 40% y of the photo).
  // Decorative inside the heading: the name is already in the nav, so empty alt keeps the headline readable.
  return (
    <span style={order(i)} className={`${pill} relative overflow-hidden`}>
      <img
        src={profile.photo}
        alt=""
        onError={() => setMissing(true)}
        className="absolute inset-0 size-full origin-[49%_53%] scale-[2.2] object-cover object-[50%_30%]"
      />
    </span>
  )
}

export function Hero() {
  const companies = experience.map((e) => e.company)
  const mesh = useRef<HTMLDivElement>(null)

  // The gradient leans toward the pointer. Writes CSS vars directly, so no re-render.
  const follow = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || !mesh.current) return
    const r = e.currentTarget.getBoundingClientRect()
    mesh.current.style.setProperty('--mx', String(((e.clientX - r.left) / r.width) * 2 - 1))
    mesh.current.style.setProperty('--my', String(((e.clientY - r.top) / r.height) * 2 - 1))
  }

  return (
    <section id="top" className="relative overflow-hidden" onPointerMove={follow}>
      <div ref={mesh} aria-hidden className="mesh pointer-events-none absolute inset-x-0 top-10 mx-auto h-[420px] max-w-[1100px] opacity-60" />
      <div className="relative mx-auto max-w-[1200px] px-4 pt-24 pb-20 text-center sm:px-6 sm:pt-32">
        <p style={order(0)} className="intro inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1 text-sm text-body shadow-card">
          <span className="live-dot size-2 rounded-full bg-cyan" aria-hidden />
          {profile.role} in {profile.location}
        </p>
        <h1 className="mx-auto mt-6 max-w-[17ch] text-[40px] leading-[48px] font-semibold tracking-[-2px] text-balance sm:text-[64px] sm:leading-[68px] sm:tracking-[-3.2px]">
          {HEADLINE.map((word, i) => (
            <span key={i}>
              {word === 'PHOTO' ? (
                <PhotoPill i={i + 1} />
              ) : (
                <span style={order(i + 1)} className="intro inline-block">
                  {word}
                </span>
              )}
              {i < HEADLINE.length - 1 && ' '}
            </span>
          ))}
        </h1>
        <p style={order(AFTER_HEADLINE)} className="intro mx-auto mt-6 max-w-[60ch] text-lg leading-7 text-body">
          {profile.summary}
        </p>
        <div style={order(AFTER_HEADLINE + 1)} className="intro mt-10 flex flex-wrap justify-center gap-3">
          <a href="#projects" className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-on-ink transition-transform hover:-translate-y-0.5 hover:bg-ink-hover">
            See my projects
          </a>
          <a href={`mailto:${profile.email}`} className="inline-flex h-12 items-center rounded-full bg-canvas px-6 font-medium shadow-card transition-transform hover:-translate-y-0.5 hover:bg-canvas-soft-2">
            Email me
          </a>
        </div>
      </div>

      <div style={order(AFTER_HEADLINE + 2)} className="intro relative border-y border-hairline bg-canvas">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 text-sm text-body">
          <span className="text-mute">Built software for</span>
          {companies.map((c) => (
            <span key={c} className="font-medium text-ink">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
