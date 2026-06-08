function PageHeader({ eyebrow = 'FOREP', title, description, action }) {
  return (
    <div className="page-animate relative mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 opacity-0 shadow-sm shadow-slate-200/70 dark:shadow-none sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_34%),linear-gradient(135deg,rgba(79,70,229,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_34%),linear-gradient(135deg,rgba(79,70,229,0.12),transparent_42%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0284c7] dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-[#38bdf8]">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-[var(--text)] sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[15px]">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
      </div>
    </div>
  )
}

export default PageHeader
