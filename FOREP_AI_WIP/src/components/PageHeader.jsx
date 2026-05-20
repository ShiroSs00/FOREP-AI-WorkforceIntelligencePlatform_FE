function PageHeader({ eyebrow = 'FOREP MVP', title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-[var(--text)]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export default PageHeader
