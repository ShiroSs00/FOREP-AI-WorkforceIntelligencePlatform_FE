function EmptyState({ title = 'No results', description = 'Try adjusting the search or filters.' }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
      <p className="font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
    </div>
  )
}

export default EmptyState
