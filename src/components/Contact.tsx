import { profile } from '../data'

const year = new Date().getFullYear()

export function Contact() {
  return (
    <footer id="contact" className="bg-band text-white">
      <div className="reveal mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <h2 className="max-w-[18ch] text-[40px] leading-[44px] font-semibold tracking-[-2px] sm:text-[48px] sm:leading-[48px] sm:tracking-[-2.4px]">
          Have a system your team is waiting on?
        </h2>
        <p className="mt-4 max-w-[52ch] text-lg leading-7 text-[#a1a1a1]">
          I take on web and mobile work, from a single dashboard to the API and app behind it.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className="inline-flex h-12 items-center rounded-full bg-white px-6 font-medium text-band hover:bg-[#ebebeb]">
            {profile.email}
          </a>
          <a href={profile.cv} download className="inline-flex h-12 items-center rounded-full px-6 font-medium ring-1 ring-white/25 hover:bg-white/10">
            Download CV (PDF)
          </a>
        </div>
        <div className="mt-24 flex flex-wrap justify-between gap-4 border-t border-white/15 pt-6 text-sm text-[#a1a1a1]">
          <span>© {year} {profile.name}</span>
          <span>{profile.location}</span>
        </div>
      </div>
    </footer>
  )
}
