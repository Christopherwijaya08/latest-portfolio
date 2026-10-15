import { profile } from '../data'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-4 sm:px-6">
        <a href="#top" className="mr-auto text-sm font-semibold tracking-[-0.28px]">
          {profile.name}
        </a>
        <ul className="hidden items-center sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3 py-2 text-sm text-body transition-colors hover:bg-canvas-soft-2 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
        <a
          href={profile.cv}
          download
          className="inline-flex h-8 items-center rounded-full bg-ink px-3 text-sm font-medium text-on-ink hover:bg-ink-hover"
        >
          Download CV
        </a>
      </nav>
    </header>
  )
}
