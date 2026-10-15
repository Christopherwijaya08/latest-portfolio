type Props = { title: string; lead?: string; dark?: boolean }

export function SectionHead({ title, lead, dark }: Props) {
  return (
    <div className="reveal max-w-[640px]">
      <h2 className="text-[32px] leading-10 font-semibold tracking-[-1.28px]">{title}</h2>
      {lead && <p className={`mt-3 text-lg leading-7 ${dark ? 'text-hairline-strong' : 'text-body'}`}>{lead}</p>}
    </div>
  )
}
