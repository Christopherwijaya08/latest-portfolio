import { experience } from '../data'
import { SectionHead } from './SectionHead'

export function Experience() {
  return (
    <section id="experience" className="border-y border-hairline bg-canvas">
      <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
        <SectionHead title="Experience." lead="Three years across in-office, remote and enterprise teams." />
        <ol className="mt-12 border-l border-hairline">
          {experience.map((job) => (
            <li key={job.company} className="reveal relative grid gap-2 pb-12 pl-8 last:pb-0 md:grid-cols-[220px_1fr] md:gap-10">
              <span className="absolute top-2 -left-[5px] size-[9px] rounded-full border-2 border-canvas bg-ink" aria-hidden />
              <p className="font-mono text-[13px] leading-6 text-mute">{job.period}</p>
              <div>
                <h3 className="text-xl leading-7 font-semibold tracking-[-0.6px]">{job.role}</h3>
                <p className="text-body">{job.company}</p>
                <ul className="mt-4 max-w-[68ch] list-disc space-y-2 pl-5 leading-6 text-body marker:text-hairline-strong">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
