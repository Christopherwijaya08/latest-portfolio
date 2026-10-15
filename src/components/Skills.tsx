import { education, skills } from '../data'
import { SectionHead } from './SectionHead'

export function Skills() {
  return (
    <section id="skills" className="mx-auto grid max-w-[1200px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <SectionHead title="Tools I work with." />
        <dl className="mt-10 divide-y divide-hairline border-y border-hairline">
          {skills.map((s) => (
            <div key={s.group} className="reveal grid gap-3 py-5 sm:grid-cols-[160px_1fr]">
              <dt className="text-sm font-medium">{s.group}</dt>
              <dd className="flex flex-wrap gap-2">
                {s.items.map((i) => (
                  <span key={i} className="rounded-full bg-canvas px-3 py-1 text-sm text-body shadow-card">
                    {i}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <SectionHead title="Education." />
        <div className="reveal mt-10 rounded-xl bg-canvas p-8 shadow-float">
          <p className="font-mono text-[13px] text-mute">{education.period}</p>
          <h3 className="mt-2 text-xl leading-7 font-semibold tracking-[-0.6px]">{education.degree}</h3>
          <p className="mt-1 text-body">{education.school}</p>
          <p className="mt-4 leading-6 text-body">
            Programming, system design and software development, with most of the learning done in team projects.
          </p>
        </div>
      </div>
    </section>
  )
}
